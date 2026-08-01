import http from "node:http";
import { getEnv } from "./config/env";
import { logger } from "./config/logger";
import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./database/connection";

async function main(): Promise<void> {
  const env = getEnv();
  await connectDatabase();
  const app = createApp();
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

void main().catch((error) => {
  logger.fatal({ err: error }, "API startup failed");
  process.exit(1);
});
