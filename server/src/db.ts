import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing from server/.env");
  if (uri.includes("YOUR_CLUSTER") || uri.includes("USERNAME:PASSWORD")) {
    throw new Error(
      "Replace the MongoDB URI placeholders in server/.env with your actual Atlas connection details.",
    );
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 });
  console.log("MongoDB connected successfully");
}
