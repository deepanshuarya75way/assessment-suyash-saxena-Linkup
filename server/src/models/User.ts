import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["lead", "engineer", "employee"], required: true },
    organization: { type: String, required: true, trim: true },
    department: { type: String, default: "General" },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const User = mongoose.models.User || mongoose.model("User", userSchema);
