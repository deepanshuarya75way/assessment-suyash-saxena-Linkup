import { Router } from "express";
import { createTicket, listTickets, updateTicket } from "../controllers/ticketController";
import { requireAuth, requireSupportRole } from "../middleware/auth";

const router = Router();
router.get("/", requireAuth, listTickets);
router.post("/", requireAuth, createTicket);
router.patch("/:id", requireAuth, requireSupportRole, updateTicket);
export default router;
