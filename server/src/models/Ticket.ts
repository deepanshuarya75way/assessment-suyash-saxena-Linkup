import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ticketSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: String, required: true, trim: true },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    organization: { type: String, required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resolutionNote: { type: String, default: "" },
  },
  { timestamps: true },
);

export type TicketDocument = InferSchemaType<typeof ticketSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
