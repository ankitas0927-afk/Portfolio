import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import type { Express } from "express";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { logger } from "../config/logger.js";

function resolveFrontendUrl(): string | undefined {
  const frontendUrl = process.env.FRONTEND_URL?.trim();
  if (frontendUrl) {
    return frontendUrl;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  return vercelUrl ? `https://${vercelUrl}` : undefined;
}

export function applySecurity(app: Express): void {
  const frontendUrl = resolveFrontendUrl();
  const isTest = process.env.NODE_ENV === "test";

  app.disable("x-powered-by");
  const connectSrc = ["'self'"];
  if (frontendUrl) {
    connectSrc.push(frontendUrl);
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "img-src": ["'self'", "data:", "blob:"],
          "script-src": ["'self'"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "connect-src": connectSrc
        }
      }
    }),
  );
  app.use(
    cors({
      origin: frontendUrl ?? true,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.requestId ?? req.id,
      customProps: (req) => ({ requestId: req.requestId })
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: isTest ? 1000 : 300,
      standardHeaders: true,
      legacyHeaders: false
    }),
  );
}

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many authentication attempts" } }
});

export const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many contact submissions" } }
});
