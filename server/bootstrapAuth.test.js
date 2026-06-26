import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { AdminAuth } from "./models.js";
import { ensureAdminAuth } from "./bootstrapAuth.js";
import { verifyPassword } from "./auth.js";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await AdminAuth.deleteMany({});
});

describe("ensureAdminAuth", () => {
  it("seeds a hashed password from the env var when none exists", async () => {
    process.env.INITIAL_DASHBOARD_PASSWORD = "s3cret";
    await ensureAdminAuth();
    const doc = await AdminAuth.findOne();
    expect(doc).not.toBeNull();
    expect(await verifyPassword("s3cret", doc.passwordHash)).toBe(true);
  });

  it("does not overwrite an existing password", async () => {
    process.env.INITIAL_DASHBOARD_PASSWORD = "first";
    await ensureAdminAuth();
    process.env.INITIAL_DASHBOARD_PASSWORD = "second";
    await ensureAdminAuth();
    const docs = await AdminAuth.find();
    expect(docs.length).toBe(1);
    expect(await verifyPassword("first", docs[0].passwordHash)).toBe(true);
  });
});
