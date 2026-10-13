import { Router } from "express";
import { listUsers } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.get("/", requireAuth, listUsers);
export default router;
