import mongoose from "mongoose";
import { getEnv } from "../config/env";
import { logger } from "../config/logger";

export async function connectDatabase(uri = getEnv().MONGODB_URI): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);
  mongoose.set("sanitizeFilter", true);

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
    autoIndex: getEnv().NODE_ENV !== "production"
  });

  logger.info("MongoDB connected");
  return mongoose;
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
