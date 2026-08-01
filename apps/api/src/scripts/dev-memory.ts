import http from "node:http";
import { MongoMemoryServer } from "mongodb-memory-server";

function applyDevDefaults(uri: string): void {
  Object.assign(process.env, {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "5000",
    MONGODB_URI: uri,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    API_PUBLIC_URL: process.env.API_PUBLIC_URL || "http://localhost:5000",
    JWT_ACCESS_SECRET:
      process.env.JWT_ACCESS_SECRET || "dev_access_secret_replace_before_real_deployment_123",
    JWT_REFRESH_SECRET:
      process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_replace_before_real_deployment_123",
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    COOKIE_SECURE: process.env.COOKIE_SECURE || "false",
    COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || "lax",
    ADMIN_NAME: process.env.ADMIN_NAME || "Portfolio Administrator",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@example.com",
    ADMIN_INITIAL_PASSWORD: process.env.ADMIN_INITIAL_PASSWORD || "ChangeThisPassword123!",
    RESUME_PDF_PATH: process.env.RESUME_PDF_PATH || "../../../Ankita CV edit.pdf",
    MAX_PROFILE_IMAGE_MB: process.env.MAX_PROFILE_IMAGE_MB || "5",
    MAX_CONTENT_IMAGE_MB: process.env.MAX_CONTENT_IMAGE_MB || "8",
    MAX_RESUME_MB: process.env.MAX_RESUME_MB || "10",
    MAX_CERTIFICATE_MB: process.env.MAX_CERTIFICATE_MB || "10",
    MAX_DOCUMENT_MB: process.env.MAX_DOCUMENT_MB || "15"
  });
}

async function main(): Promise<void> {
  const mongo = await MongoMemoryServer.create();
  applyDevDefaults(mongo.getUri());

  const envModule = await import("../config/env");
  envModule.resetEnvForTests();
  const { getEnv } = envModule;
  const { logger } = await import("../config/logger");
  const { seed } = await import("./seed");
  const { createApp } = await import("../app");
  const { disconnectDatabase } = await import("../database/connection");

  await seed();
  const app = createApp();
  const server = http.createServer(app);
  const env = getEnv();

  server.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        adminEmail: env.ADMIN_EMAIL,
        note: "Memory MongoDB is for local preview only"
      },
      "Memory-backed API server listening",
    );
  });

  const shutdown = async (): Promise<void> => {
    server.close(async () => {
      await disconnectDatabase();
      await mongo.stop();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
