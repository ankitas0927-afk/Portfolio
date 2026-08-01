import express from "express";
import { requestId } from "./middleware/requestId";
import { applySecurity } from "./middleware/security";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { publicRouter } from "./routes/public.routes";
import { authRouter } from "./routes/auth.routes";
import { adminRouter } from "./routes/admin.routes";

export function createApp() {
  const app = express();

  app.use(requestId);
  applySecurity(app);

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "ankita-portfolio-api" });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1", publicRouter);
  app.use("/api/v1/admin", adminRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
