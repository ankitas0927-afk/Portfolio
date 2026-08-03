import express from "express";
import type { NextFunction, Request, Response } from "express";
import { requestId } from "./middleware/requestId.js";
import { applySecurity } from "./middleware/security.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { publicRouter } from "./routes/public.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { connectDatabase } from "./database/connection.js";

async function ensureDatabaseConnection(_req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
}

export function createApp() {
  const app = express();

  app.use(requestId);
  applySecurity(app);

  app.get("/", (_req, res) => {
    const publicSiteUrl = process.env.FRONTEND_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
    res.setHeader("Cache-Control", "no-store");
    if (publicSiteUrl) {
      res.redirect(302, publicSiteUrl);
      return;
    }
    res.status(200).json({
      ok: true,
      service: "ankita-portfolio-api",
      message: "This deployment serves the API. Deploy apps/web for the public portfolio site."
    });
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "ankita-portfolio-api" });
  });

  app.use("/api/v1", ensureDatabaseConnection);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1", publicRouter);
  app.use("/api/v1/admin", adminRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
