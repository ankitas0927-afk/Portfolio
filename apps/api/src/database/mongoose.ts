import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let cachedConnectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: env.NODE_ENV === 'production' ? 30 : 10,
    });
  }

  const connection = await cachedConnectionPromise;
  logger.info({ host: connection.connection.host }, 'MongoDB connected');
  return connection;
}

export async function disconnectFromDatabase(): Promise<void> {
  cachedConnectionPromise = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
