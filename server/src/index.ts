import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { connectDatabase } from "./config/db";
import { User } from "./models/User";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import ticketRoutes from "./routes/ticketRoutes";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(",").map((value) => value.trim())
      : true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Linkup API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled API error:", err);
  res.status(500).json({ message: "Internal server error" });
});

async function seedDemoUsers(): Promise<void> {
  const passwordHash = await bcrypt.hash("Demo123!", 10);
  const demoUsers = [
    {
      name: "Olivia Carter",
      email: "lead@linkup.demo",
      role: "lead",
      organization: "Northstar Retail",
      department: "IT Support",
    },
    {
      name: "Ethan Brooks",
      email: "engineer@linkup.demo",
      role: "engineer",
      organization: "Northstar Retail",
      department: "IT Support",
    },
    {
      name: "Ava Patel",
      email: "employee@linkup.demo",
      role: "employee",
      organization: "Northstar Retail",
      department: "Operations",
    },
    {
      name: "Noah Williams",
      email: "employee@acme.demo",
      role: "employee",
      organization: "Acme Health",
      department: "Operations",
    },
  ];

  for (const demo of demoUsers) {
    await User.updateOne(
      { email: demo.email },
      { $setOnInsert: { ...demo, passwordHash } },
      { upsert: true },
    );
  }
  console.log("Demo accounts ready (password: Demo123!)");
}

async function start(): Promise<void> {
  await connectDatabase();
  await seedDemoUsers();
  app.listen(port, "0.0.0.0", () => {
    console.log(`Linkup API running at http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start Linkup API:", error);
  process.exit(1);
});
