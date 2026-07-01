import { describe, it, expect } from "vitest";
import { statusUpdateEmail } from "./email.js";

const base = {
  orderNumber: "IB-XYZ789",
  total: 23,
  customer: { fullName: "Jane Doe", phone: "+961 70123456", email: "jane@example.com" },
};

describe("statusUpdateEmail", () => {
  it("returns null for pending (no email for that status)", () => {
    expect(statusUpdateEmail({ ...base, status: "pending" })).toBeNull();
  });
  it("builds a confirmed email referencing the order number", () => {
    const built = statusUpdateEmail({ ...base, status: "confirmed" });
    expect(built).not.toBeNull();
    expect(built.subject.toLowerCase()).toContain("confirmed");
    expect(built.html).toContain("IB-XYZ789");
  });
  it("builds delivered and cancelled emails", () => {
    expect(statusUpdateEmail({ ...base, status: "delivered" }).subject.toLowerCase()).toContain("delivered");
    expect(statusUpdateEmail({ ...base, status: "cancelled" }).subject.toLowerCase()).toContain("cancelled");
  });
});
