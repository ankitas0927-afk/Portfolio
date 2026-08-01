import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Request, Response } from "express";
import type { Types } from "mongoose";
import { getEnv } from "../config/env";
import { AppError } from "../errors/appError";
import { Admin, type AdminDocument } from "../models/admin";
import { Session } from "../models/session";
import { createOpaqueToken, sha256 } from "../utils/crypto";
import { recordAuditLog } from "./auditLog.service";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type JwtPayload = {
  sub: string;
  email: string;
  role: "owner" | "editor";
};

function signAccessToken(admin: Pick<AdminDocument, "_id" | "email" | "role">): string {
  const env = getEnv();
  const payload: JwtPayload = {
    sub: admin._id.toString(),
    email: admin.email,
    role: admin.role
  };
  const expiresIn = env.JWT_ACCESS_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>;
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

function refreshExpiry(): Date {
  const match = /^(\d+)([dhm])$/.exec(getEnv().JWT_REFRESH_EXPIRES_IN);
  const value = match ? Number(match[1]) : 7;
  const unit = match ? match[2] : "d";
  const multiplier = unit === "h" ? 60 * 60 * 1000 : unit === "m" ? 60 * 1000 : 24 * 60 * 60 * 1000;
  return new Date(Date.now() + value * multiplier);
}

function setRefreshCookie(res: Response, token: string): void {
  const env = getEnv();
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api/v1/auth",
    maxAge: refreshExpiry().getTime() - Date.now()
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie("refreshToken", { path: "/api/v1/auth" });
}

export async function createInitialAdmin(): Promise<AdminDocument> {
  const env = getEnv();
  const existing = await Admin.findOne({ email: env.ADMIN_EMAIL }).select("+passwordHash");
  if (existing) {
    return existing;
  }
  const passwordHash = await bcrypt.hash(env.ADMIN_INITIAL_PASSWORD, 12);
  return Admin.create({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    passwordHash,
    role: "owner",
    isActive: true
  });
}

async function issueTokens(admin: AdminDocument, req: Request, res: Response): Promise<AuthTokens> {
  const refreshToken = createOpaqueToken();
  await Session.create({
    adminId: admin._id,
    refreshTokenHash: sha256(refreshToken),
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
    expiresAt: refreshExpiry()
  });
  setRefreshCookie(res, refreshToken);
  return { accessToken: signAccessToken(admin), refreshToken };
}

export async function loginAdmin(
  email: string,
  password: string,
  req: Request,
  res: Response,
): Promise<{ admin: { id: string; name: string; email: string; role: string }; accessToken: string }> {
  const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true }).select("+passwordHash");
  if (!admin) {
    await recordAuditLog({ action: "failed_login", resourceType: "Admin", requestId: req.requestId });
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    await recordAuditLog({ adminId: admin._id, action: "failed_login", resourceType: "Admin", requestId: req.requestId });
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  admin.lastLoginAt = new Date();
  await admin.save();
  const tokens = await issueTokens(admin, req, res);
  await recordAuditLog({ adminId: admin._id, action: "login", resourceType: "Admin", requestId: req.requestId });

  return {
    admin: { id: admin._id.toString(), name: admin.name, email: admin.email, role: admin.role },
    accessToken: tokens.accessToken
  };
}

export async function refreshAdminSession(
  req: Request,
  res: Response,
): Promise<{ accessToken: string; admin: { id: string; name: string; email: string; role: string } }> {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (!refreshToken) {
    throw new AppError(401, "MISSING_REFRESH_TOKEN", "Refresh token is missing");
  }

  const session = await Session.findOne({
    refreshTokenHash: sha256(refreshToken),
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  });

  if (!session) {
    clearRefreshCookie(res);
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired");
  }

  session.revokedAt = new Date();
  await session.save();

  const admin = await Admin.findOne({ _id: session.adminId, isActive: true });
  if (!admin) {
    clearRefreshCookie(res);
    throw new AppError(401, "ADMIN_INACTIVE", "Administrator account is inactive");
  }

  const tokens = await issueTokens(admin, req, res);
  await recordAuditLog({ adminId: admin._id, action: "refresh_session", resourceType: "Session", requestId: req.requestId });
  return {
    accessToken: tokens.accessToken,
    admin: { id: admin._id.toString(), name: admin.name, email: admin.email, role: admin.role }
  };
}

export async function logoutAdmin(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (refreshToken) {
    await Session.updateOne({ refreshTokenHash: sha256(refreshToken) }, { $set: { revokedAt: new Date() } });
  }
  clearRefreshCookie(res);
  if (req.admin) {
    await recordAuditLog({ adminId: req.admin.id, action: "logout", resourceType: "Session", requestId: req.requestId });
  }
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, getEnv().JWT_ACCESS_SECRET);
    if (typeof decoded !== "object" || !("sub" in decoded) || !("email" in decoded) || !("role" in decoded)) {
      throw new AppError(401, "INVALID_ACCESS_TOKEN", "Access token is invalid");
    }
    return decoded as JwtPayload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "INVALID_ACCESS_TOKEN", "Access token is invalid or expired");
  }
}

export async function changePassword(
  adminId: Types.ObjectId,
  currentPassword: string,
  nextPassword: string,
  requestId?: string,
): Promise<void> {
  const admin = await Admin.findById(adminId).select("+passwordHash");
  if (!admin) {
    throw new AppError(404, "ADMIN_NOT_FOUND", "Administrator was not found");
  }
  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    throw new AppError(400, "INVALID_PASSWORD", "Current password is incorrect");
  }
  admin.passwordHash = await bcrypt.hash(nextPassword, 12);
  await admin.save();
  await Session.updateMany({ adminId }, { $set: { revokedAt: new Date() } });
  await recordAuditLog({ adminId, action: "password_change", resourceType: "Admin", requestId });
}
