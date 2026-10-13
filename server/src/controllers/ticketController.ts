import mongoose from "mongoose";
import type { Response } from "express";
import { Ticket } from "../models/Ticket";
import { User } from "../models/User";
import type { AuthRequest } from "../middleware/auth";

const allowedStatuses = ["open", "in_progress", "resolved", "closed"];
const allowedPriorities = ["low", "medium", "high", "urgent"];

export async function listTickets(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const filter: Record<string, unknown> = { organization: req.user.organization };
  if (req.user.role === "employee") filter.createdBy = req.user.id;

  const tickets = await Ticket.find(filter)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 });

  res.json(
    tickets.map((t: any) => ({
      id: String(t._id),
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: t.status,
      organization: t.organization,
      createdBy: t.createdBy
        ? { id: String(t.createdBy._id), name: t.createdBy.name, email: t.createdBy.email }
        : null,
      assignedTo: t.assignedTo
        ? {
            id: String(t.assignedTo._id),
            name: t.assignedTo.name,
            email: t.assignedTo.email,
            role: t.assignedTo.role,
          }
        : null,
      resolutionNote: t.resolutionNote,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
  );
}

export async function createTicket(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const title = String(req.body?.title || "").trim();
  const description = String(req.body?.description || "").trim();
  const category = String(req.body?.category || "General").trim();
  const priority = String(req.body?.priority || "medium").toLowerCase();

  if (title.length < 3 || description.length < 5) {
    res
      .status(400)
      .json({
        message: "Enter a title (at least 3 characters) and description (at least 5 characters)",
      });
    return;
  }
  if (!allowedPriorities.includes(priority)) {
    res.status(400).json({ message: "Invalid priority" });
    return;
  }

  const ticket = await Ticket.create({
    title,
    description,
    category,
    priority,
    status: "open",
    organization: req.user.organization,
    createdBy: req.user.id,
  });

  const populated = await Ticket.findById(ticket._id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email role");

  res.status(201).json(populated);
}

export async function updateTicket(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  if (req.user.role === "employee") {
    res.status(403).json({ message: "Only support staff can update tickets" });
    return;
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid ticket ID" });
    return;
  }

  // Scope the lookup to the user's organization to prevent cross-tenant updates.
  const ticket = await Ticket.findOne({ _id: req.params.id, organization: req.user.organization });
  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }

  const body = req.body || {};
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    ticket.status = status as any;
  }
  if (body.priority !== undefined) {
    const priority = String(body.priority).toLowerCase();
    if (!allowedPriorities.includes(priority)) {
      res.status(400).json({ message: "Invalid priority" });
      return;
    }
    ticket.priority = priority as any;
  }
  if (body.resolutionNote !== undefined)
    ticket.resolutionNote = String(body.resolutionNote).slice(0, 5000);

  if (body.assignedTo !== undefined) {
    if (body.assignedTo === null || body.assignedTo === "") {
      ticket.assignedTo = null;
    } else {
      if (!mongoose.isValidObjectId(String(body.assignedTo))) {
        res.status(400).json({ message: "Invalid assignee" });
        return;
      }
      const assignee = await User.findOne({
        _id: String(body.assignedTo),
        organization: req.user.organization,
        role: { $in: ["lead", "engineer"] },
      });
      if (!assignee) {
        res.status(400).json({ message: "Assignee must be support staff in your organization" });
        return;
      }
      ticket.assignedTo = assignee._id;
    }
  }

  await ticket.save();
  const updated = await Ticket.findById(ticket._id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email role");
  res.json(updated);
}
