import type { Response } from "express";
import { User } from "../models/User";
import type { AuthRequest } from "../middleware/auth";

export async function listUsers(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  // Only return support teammates from the caller's own organization.
  const users = await User.find({
    organization: req.user.organization,
    role: { $in: ["lead", "engineer"] },
  }).select("name email role organization department");

  res.json(
    users.map((u: any) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      organization: u.organization,
      department: u.department,
    })),
  );
}
