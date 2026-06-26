import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  // app.js constructs an ImageKit client at import time; give it dummy values.
  process.env.IMAGEKIT_PUBLIC_KEY = "x";
  process.env.IMAGEKIT_PRIVATE_KEY = "x";
  process.env.IMAGEKIT_URL_ENDPOINT = "https://example.com";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  ({ default: app } = await import("./app.js"));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  const { AdminAuth } = await import("./models.js");
  const { hashPassword } = await import("./auth.js");
  await AdminAuth.deleteMany({});
  await AdminAuth.create({ passwordHash: await hashPassword("letmein") });
});

describe("auth routes", () => {
  it("rejects login with the wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "nope" });
    expect(res.status).toBe(401);
  });

  it("logs in with the correct password and sets a cookie", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "letmein" });
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"][0]).toMatch(/token=/);
  });

  it("blocks a protected route without a cookie", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(401);
  });

  it("allows /api/auth/check with a valid cookie", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ password: "letmein" });
    const res = await agent.get("/api/auth/check");
    expect(res.status).toBe(200);
    expect(res.body.authenticated).toBe(true);
  });

  it("changes the password and invalidates the old one", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ password: "letmein" });
    const change = await agent
      .put("/api/auth/password")
      .send({ currentPassword: "letmein", newPassword: "newpass" });
    expect(change.status).toBe(200);

    const oldLogin = await request(app)
      .post("/api/auth/login")
      .send({ password: "letmein" });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/api/auth/login")
      .send({ password: "newpass" });
    expect(newLogin.status).toBe(200);
  });
});
