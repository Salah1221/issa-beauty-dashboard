import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const { mail } = vi.hoisted(() => ({ mail: { sent: [], mode: "resolve" } }));
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: async (payload) => {
        mail.sent.push(payload);
        if (mail.mode === "reject") throw new Error("resend boom");
        return { id: "test" };
      },
    };
  },
}));

let mongo, app, Order, AdminAuth, hashPassword;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.IMAGEKIT_PUBLIC_KEY = "x";
  process.env.IMAGEKIT_PRIVATE_KEY = "x";
  process.env.IMAGEKIT_URL_ENDPOINT = "https://example.com";
  process.env.RESEND = "test-key";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  ({ default: app } = await import("./app.js"));
  ({ Order, AdminAuth } = await import("./models.js"));
  ({ hashPassword } = await import("./auth.js"));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

const makeOrder = (over = {}) =>
  Order.create({
    orderNumber: "IB-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    items: [{ productId: new mongoose.Types.ObjectId(), name: "X", unitPrice: 10, discountPercentage: 0, quantity: 1, lineTotal: 10, imageUrl: "u" }],
    subtotal: 10, deliveryFee: 3, total: 13,
    customer: { fullName: "Jane", phone: "70123456", email: "jane@example.com" },
    shipping: { address: "1 St", city: "Beirut" },
    ...over,
  });

async function agent() {
  const a = request.agent(app);
  await a.post("/api/auth/login").send({ password: "letmein" });
  return a;
}

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  await Order.deleteMany({});
  await AdminAuth.deleteMany({});
  await AdminAuth.create({ passwordHash: await hashPassword("letmein") });
  mail.sent = [];
  mail.mode = "resolve";
});

describe("status-update emails on PATCH /api/orders/:id/status", () => {
  it("emails the customer when moved to confirmed", async () => {
    const o = await makeOrder({ status: "pending" });
    const a = await agent();
    const res = await a.patch(`/api/orders/${o._id}/status`).send({ status: "confirmed" });
    expect(res.status).toBe(200);
    await flush();
    expect(mail.sent.map((m) => m.to)).toContain("jane@example.com");
  });

  it("does not email when the order has no customer email", async () => {
    const o = await makeOrder({ status: "pending", customer: { fullName: "No Email", phone: "70000000" } });
    const a = await agent();
    const res = await a.patch(`/api/orders/${o._id}/status`).send({ status: "delivered" });
    expect(res.status).toBe(200);
    await flush();
    expect(mail.sent).toHaveLength(0);
  });

  it("still returns 200 when the email send rejects", async () => {
    mail.mode = "reject";
    const o = await makeOrder({ status: "pending" });
    const a = await agent();
    const res = await a.patch(`/api/orders/${o._id}/status`).send({ status: "cancelled" });
    expect(res.status).toBe(200);
    await flush();
    expect(res.body.data.status).toBe("cancelled");
  });

  it("sends no email when statusUpdateEmail returns null (pending status)", async () => {
    const o = await makeOrder({ status: "confirmed" });
    const a = await agent();
    const res = await a.patch(`/api/orders/${o._id}/status`).send({ status: "pending" });
    expect(res.status).toBe(200);
    await flush();
    expect(mail.sent).toHaveLength(0);
  });
});
