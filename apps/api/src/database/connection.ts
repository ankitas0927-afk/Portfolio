import mongoose from "mongoose";
import { getEnv } from "../config/env.js";
import { logger } from "../config/logger.js";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDatabase(uri = getEnv().MONGODB_URI): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);
  mongoose.set("sanitizeFilter", true);

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      autoIndex: process.env.NODE_ENV !== "production"
    })
    .then(() => {
      logger.info("MongoDB connected");
      return mongoose;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connectionPromise = null;
}
