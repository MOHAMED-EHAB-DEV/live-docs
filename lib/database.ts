// db.ts
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

// Setup Mongoose connection
export const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  return mongoose.connect(uri);
};
