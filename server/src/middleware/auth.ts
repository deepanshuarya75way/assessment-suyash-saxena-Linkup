import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type UserRole = "lead" | "engineer" | "employee";
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  department?: string;
}
export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function signAuthToken(user: AuthUser): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in server/.env");
  return jwt.sign(user, secret, { expiresIn: "7d" });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    req.user = jwt.verify(token, secret) as AuthUser;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireSupportRole(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || !["lead", "engineer"].includes(req.user.role)) {
    res.status(403).json({ message: "Support-team access required" });
    return;
  }
  next();
}
