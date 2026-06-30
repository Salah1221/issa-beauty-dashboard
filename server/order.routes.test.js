import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo, app, Order, AdminAuth, hashPassword;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.IMAGEKIT_PUBLIC_KEY = "x";
  process.env.IMAGEKIT_PRIVATE_KEY = "x";
  process.env.IMAGEKIT_URL_ENDPOINT = "https://example.com";
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

const makeOrder = (over = {}) => ({
  orderNumber: "IB-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
  items: [{ productId: new mongoose.Types.ObjectId(), name: "X", unitPrice: 10,
    discountPercentage: 0, quantity: 1, lineTotal: 10, imageUrl: "u" }],
  subtotal: 10, deliveryFee: 3, total: 13,
  customer: { fullName: "Jane", phone: "70123456" },
  shipping: { address: "1 St", city: "Beirut" },
  ...over,
});

async function authedAgent() {
  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({ password: "letmein" });
  return agent;
}

beforeEach(async () => {
  await Order.deleteMany({});
  await AdminAuth.deleteMany({});
  await AdminAuth.create({ passwordHash: await hashPassword("letmein") });
});

describe("order routes", () => {
  it("requires auth for GET /api/orders", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
  });

  it("lists orders newest first with pendingCount", async () => {
    await Order.create(makeOrder({ status: "pending" }));
    await Order.create(makeOrder({ status: "confirmed" }));
    await Order.create(makeOrder({ status: "pending" }));
    const agent = await authedAgent();
    const res = await agent.get("/api/orders");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.pendingCount).toBe(2);
    expect(res.body.data).toHaveLength(3);
  });

  it("filters by status", async () => {
    await Order.create(makeOrder({ status: "pending" }));
    await Order.create(makeOrder({ status: "delivered" }));
    const agent = await authedAgent();
    const res = await agent.get("/api/orders?status=delivered");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe("delivered");
    // pendingCount stays global, not affected by the filter
    expect(res.body.pendingCount).toBe(1);
  });

  it("paginates", async () => {
    for (let i = 0; i < 25; i++) await Order.create(makeOrder());
    const agent = await authedAgent();
    const res = await agent.get("/api/orders?page=2&limit=20");
    expect(res.body.data).toHaveLength(5);
    expect(res.body.pages).toBe(2);
  });

  it("updates an order status", async () => {
    const order = await Order.create(makeOrder({ status: "pending" }));
    const agent = await authedAgent();
    const res = await agent
      .patch(`/api/orders/${order._id}/status`)
      .send({ status: "confirmed" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("confirmed");
  });

  it("rejects an invalid status", async () => {
    const order = await Order.create(makeOrder());
    const agent = await authedAgent();
    const res = await agent
      .patch(`/api/orders/${order._id}/status`)
      .send({ status: "shipped" });
    expect(res.status).toBe(400);
  });

  it("404s an unknown order", async () => {
    const agent = await authedAgent();
    const res = await agent
      .patch(`/api/orders/${new mongoose.Types.ObjectId()}/status`)
      .send({ status: "confirmed" });
    expect(res.status).toBe(404);
  });

  it("returns the pending count", async () => {
    await Order.create(makeOrder({ status: "pending" }));
    await Order.create(makeOrder({ status: "pending" }));
    await Order.create(makeOrder({ status: "delivered" }));
    const agent = await authedAgent();
    const res = await agent.get("/api/orders/pending-count");
    expect(res.body.count).toBe(2);
  });
});
