import { AdminAuth } from "./models.js";
import { hashPassword } from "./auth.js";

// Ensures exactly one AdminAuth document exists. On first boot (none present)
// it seeds the password from INITIAL_DASHBOARD_PASSWORD, falling back to
// "admin" with a loud warning so the deployer changes it from the UI.
export async function ensureAdminAuth() {
  const existing = await AdminAuth.findOne();
  if (existing) return existing;

  const seed = process.env.INITIAL_DASHBOARD_PASSWORD;
  if (!seed) {
    console.warn(
      '[auth] No INITIAL_DASHBOARD_PASSWORD set — seeding default password "admin". Change it immediately from the dashboard.'
    );
  }

  const passwordHash = await hashPassword(seed || "admin");
  return AdminAuth.create({ passwordHash });
}
