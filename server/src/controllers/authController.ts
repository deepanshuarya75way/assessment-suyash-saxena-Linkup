import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signAuthToken, type AuthRequest, type AuthUser } from "../middleware/auth";

function toSafeUser(user: any): AuthUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    department: user.department,
  };
}

export async function login(req: Request, res: Response): Promise<void> {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || "");
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const safeUser = toSafeUser(user);
  res.json({ token: signAuthToken(safeUser), user: safeUser });
}

export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(toSafeUser(user));
}
