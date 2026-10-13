import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI in server/.env");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected successfully");
}
