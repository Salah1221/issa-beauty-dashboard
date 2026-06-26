import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./db.js";
import { ensureAdminAuth } from "./bootstrapAuth.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set. Refusing to start.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  await ensureAdminAuth();
  console.log(`Server listening on port ${PORT}`);
});
