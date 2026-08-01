import { Router } from "express";
import { loginSchema, passwordChangeSchema } from "@ankita-portfolio/validation";
import { Admin } from "../models/admin";
import { Session } from "../models/session";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate, requireOwner } from "../middleware/authenticate";
import { authRateLimit } from "../middleware/security";
import { validateBody } from "../middleware/validate";
import {
  changePassword,
  clearRefreshCookie,
  loginAdmin,
  logoutAdmin,
  refreshAdminSession
} from "../services/auth.service";
import { AppError } from "../errors/appError";

export const authRouter = Router();

authRouter.post(
  "/login",
  authRateLimit,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const result = await loginAdmin(email, password, req, res);
    res.json(result);
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const result = await refreshAdminSession(req, res);
    res.json(result);
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    await logoutAdmin(req, res);
    res.status(204).end();
  }),
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin?.id);
    if (!admin) {
      clearRefreshCookie(res);
      throw new AppError(404, "ADMIN_NOT_FOUND", "Administrator was not found");
    }
    res.json({
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt?.toISOString()
      }
    });
  }),
);

authRouter.post(
  "/password",
  authenticate,
  validateBody(passwordChangeSchema),
  asyncHandler(async (req, res) => {
    const { currentPassword, nextPassword } = req.body as { currentPassword: string; nextPassword: string };
    await changePassword(req.admin!.id, currentPassword, nextPassword, req.requestId);
    clearRefreshCookie(res);
    res.status(204).end();
  }),
);

authRouter.post(
  "/revoke-sessions",
  authenticate,
  requireOwner,
  asyncHandler(async (req, res) => {
    await Session.updateMany({ adminId: req.admin!.id }, { $set: { revokedAt: new Date() } });
    clearRefreshCookie(res);
    res.status(204).end();
  }),
);
