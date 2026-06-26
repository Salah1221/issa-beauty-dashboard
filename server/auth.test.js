import { describe, it, expect, beforeAll } from "vitest";
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  requireAuth,
} from "./auth.js";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret";
});

describe("password hashing", () => {
  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("hunter2");
    expect(await verifyPassword("hunter2", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("hunter2");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("tokens", () => {
  it("signs a token that verifies back to the admin role", () => {
    const token = signToken();
    expect(verifyToken(token)?.role).toBe("admin");
  });

  it("returns null for a garbage token", () => {
    expect(verifyToken("not-a-token")).toBe(null);
  });
});

describe("requireAuth middleware", () => {
  function mockRes() {
    return {
      statusCode: 0,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
  }

  it("calls next() when a valid token cookie is present", () => {
    const token = signToken();
    let called = false;
    requireAuth({ cookies: { token } }, mockRes(), () => {
      called = true;
    });
    expect(called).toBe(true);
  });

  it("responds 401 when no cookie is present", () => {
    const res = mockRes();
    let called = false;
    requireAuth({ cookies: {} }, res, () => {
      called = true;
    });
    expect(called).toBe(false);
    expect(res.statusCode).toBe(401);
  });
});
