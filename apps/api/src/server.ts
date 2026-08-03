import http from "node:http";
import { getEnv } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./database/connection.js";

const app = createApp();
const isVercel = Boolean(process.env.VERCEL);

async function bootstrap(): Promise<void> {
  if (isVercel) {
    logger.info("API initialized for Vercel runtime");
    return;
  }

  const env = getEnv();
  await connectDatabase();

  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "API server listening");
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "Shutting down API server");
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

void bootstrap().catch((error) => {
  logger.fatal({ err: error }, "API startup failed");
  process.exit(1);
});

export default app;
