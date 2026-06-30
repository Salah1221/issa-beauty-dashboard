import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo;
let Order;
let ORDER_STATUSES;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  ({ Order, ORDER_STATUSES } = await import("./models.js"));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

const validOrder = () => ({
  orderNumber: "IB-ABC123",
  items: [
    { productId: new mongoose.Types.ObjectId(), name: "Lipstick", unitPrice: 10,
      discountPercentage: 0, quantity: 2, lineTotal: 20, imageUrl: "u" },
  ],
  subtotal: 20, deliveryFee: 3, total: 23,
  customer: { fullName: "Jane", phone: "70123456" },
  shipping: { address: "1 St", city: "Beirut" },
});

describe("Order model", () => {
  it("exposes the four statuses", () => {
    expect(ORDER_STATUSES).toEqual(["pending", "confirmed", "delivered", "cancelled"]);
  });

  it("defaults status to pending and keeps order fields", async () => {
    const order = await Order.create(validOrder());
    expect(order.status).toBe("pending");
    expect(order.total).toBe(23);
    expect(order.items[0].name).toBe("Lipstick");
  });

  it("rejects an invalid status", async () => {
    const bad = validOrder();
    bad.status = "shipped";
    await expect(Order.create(bad)).rejects.toThrow();
  });
});
