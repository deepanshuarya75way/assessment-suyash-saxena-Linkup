import { Router } from "express";
import { getCurrentUser, login } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);
export default router;
