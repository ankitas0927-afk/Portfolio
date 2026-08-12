import bcrypt from 'bcrypt';
import type { CookieOptions } from 'express';
import mongoose from 'mongoose';

import { env, isProduction } from '../config/env';
import { AppError } from '../errors/app-error';
import {
  AdminModel,
  AdminSessionModel,
  RefreshTokenModel,
  type AdminDocument,
} from '../models/index';
import { createAuditLog } from './audit.service';
import { ensureAdminAccount } from './bootstrap.service';
import {
  generateOpaqueToken,
  getRefreshTokenMaxAgeMs,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type JwtPayload,
} from '../utils/auth';

export const REFRESH_COOKIE_NAME = 'ankita_refresh_token';

export interface AuthClientDetails {
  ipAddress: string;
  userAgent: string;
  requestId: string;
}

function serializeAdmin(admin: AdminDocument) {
  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    lastLoginAt: admin.lastLoginAt ?? null,
  };
}

export function getRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction || env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api/v1/auth',
    maxAge: getRefreshTokenMaxAgeMs(),
  };
}

async function issueSession(admin: AdminDocument, client: AuthClientDetails) {
  const session = await AdminSessionModel.create({
    adminId: admin._id,
    ipAddress: client.ipAddress,
    userAgent: client.userAgent,
    isActive: true,
    lastActivityAt: new Date(),
  });

  const payload: JwtPayload = {
    adminId: admin._id.toString(),
    sessionId: session._id.toString(),
    role: 'owner',
  };

  const accessToken = signAccessToken(payload);
  const opaqueNonce = generateOpaqueToken();
  const refreshTokenRecord = await RefreshTokenModel.create({
    adminId: admin._id,
    sessionId: session._id,
    tokenHash: '',
    expiresAt: new Date(Date.now() + getRefreshTokenMaxAgeMs()),
    createdByIp: client.ipAddress,
  });

  const refreshToken = signRefreshToken({
    ...payload,
    refreshTokenId: refreshTokenRecord._id.toString(),
  });

  refreshTokenRecord.tokenHash = hashToken(`${refreshToken}:${opaqueNonce}`);
  await refreshTokenRecord.save();

  await AdminModel.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });

  return {
    accessToken,
    refreshToken: `${refreshToken}:${opaqueNonce}`,
    admin: serializeAdmin(admin),
    sessionId: session._id.toString(),
  };
}

function parseStoredRefreshToken(rawCookieToken: string): { jwtToken: string; nonce: string } {
  const [jwtToken, nonce] = rawCookieToken.split(':');
  if (!jwtToken || !nonce) {
    throw new AppError(401, 'Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
  }
  return { jwtToken, nonce };
}

export async function authenticateAdmin(
  email: string,
  password: string,
  client: AuthClientDetails,
) {
  await ensureAdminAccount();
  const admin = await AdminModel.findOne({ email: email.toLowerCase() });

  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    await createAuditLog({
      action: 'failed_login',
      resourceType: 'auth',
      requestId: client.requestId,
      metadata: { email: email.toLowerCase() },
    });
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const session = await issueSession(admin as AdminDocument, client);

  await createAuditLog({
    adminId: admin._id.toString(),
    action: 'login',
    resourceType: 'auth',
    resourceId: admin._id.toString(),
    requestId: client.requestId,
    metadata: { sessionId: session.sessionId },
  });

  return session;
}

export async function refreshAdminSession(rawCookieToken: string, client: AuthClientDetails) {
  const { jwtToken, nonce } = parseStoredRefreshToken(rawCookieToken);
  const payload = verifyRefreshToken(jwtToken);

  if (!payload.refreshTokenId || !payload.sessionId) {
    throw new AppError(401, 'Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
  }

  const [tokenRecord, session, admin] = await Promise.all([
    RefreshTokenModel.findById(payload.refreshTokenId),
    AdminSessionModel.findById(payload.sessionId),
    AdminModel.findById(payload.adminId),
  ]);

  if (!tokenRecord || !session || !admin || !session.isActive) {
    throw new AppError(401, 'Session is no longer active', 'SESSION_REVOKED');
  }

  if (tokenRecord.revokedAt || tokenRecord.expiresAt.getTime() < Date.now()) {
    throw new AppError(401, 'Refresh token has expired', 'REFRESH_TOKEN_EXPIRED');
  }

  const computedHash = hashToken(`${jwtToken}:${nonce}`);
  if (computedHash !== tokenRecord.tokenHash) {
    throw new AppError(401, 'Refresh token is invalid', 'INVALID_REFRESH_TOKEN');
  }

  const newOpaqueNonce = generateOpaqueToken();
  const replacementTokenRecord = await RefreshTokenModel.create({
    adminId: admin._id,
    sessionId: session._id,
    tokenHash: '',
    expiresAt: new Date(Date.now() + getRefreshTokenMaxAgeMs()),
    createdByIp: client.ipAddress,
  });

  const newRefreshJwt = signRefreshToken({
    adminId: admin._id.toString(),
    sessionId: session._id.toString(),
    refreshTokenId: replacementTokenRecord._id.toString(),
    role: 'owner',
  });

  replacementTokenRecord.tokenHash = hashToken(`${newRefreshJwt}:${newOpaqueNonce}`);

  tokenRecord.revokedAt = new Date();
  tokenRecord.lastUsedAt = new Date();
  tokenRecord.replacedByTokenId = replacementTokenRecord._id as mongoose.Types.ObjectId;
  session.lastActivityAt = new Date();

  await Promise.all([replacementTokenRecord.save(), tokenRecord.save(), session.save()]);

  await createAuditLog({
    adminId: admin._id.toString(),
    action: 'refresh_session',
    resourceType: 'auth',
    resourceId: admin._id.toString(),
    requestId: client.requestId,
    metadata: { sessionId: session._id.toString() },
  });

  return {
    accessToken: signAccessToken({
      adminId: admin._id.toString(),
      sessionId: session._id.toString(),
      role: 'owner',
    }),
    refreshToken: `${newRefreshJwt}:${newOpaqueNonce}`,
    admin: serializeAdmin(admin as AdminDocument),
  };
}

export async function logoutAdmin(rawCookieToken: string | undefined, client: AuthClientDetails) {
  if (!rawCookieToken) {
    return;
  }

  try {
    const { jwtToken, nonce } = parseStoredRefreshToken(rawCookieToken);
    const payload = verifyRefreshToken(jwtToken);
    if (!payload.refreshTokenId || !payload.sessionId) {
      return;
    }

    const token = await RefreshTokenModel.findById(payload.refreshTokenId);
    if (token && token.tokenHash === hashToken(`${jwtToken}:${nonce}`)) {
      await Promise.all([
        RefreshTokenModel.updateOne(
          { _id: token._id },
          { $set: { revokedAt: new Date(), lastUsedAt: new Date() } },
        ),
        AdminSessionModel.updateOne(
          { _id: payload.sessionId },
          { $set: { isActive: false, lastActivityAt: new Date() } },
        ),
      ]);

      await createAuditLog({
        adminId: payload.adminId,
        action: 'logout',
        resourceType: 'auth',
        resourceId: payload.adminId,
        requestId: client.requestId,
        metadata: { sessionId: payload.sessionId },
      });
    }
  } catch {
    return;
  }
}

export async function logoutAllSessions(adminId: string, requestId: string) {
  await Promise.all([
    AdminSessionModel.updateMany({ adminId }, { $set: { isActive: false, lastActivityAt: new Date() } }),
    RefreshTokenModel.updateMany(
      { adminId, revokedAt: null },
      { $set: { revokedAt: new Date(), lastUsedAt: new Date() } },
    ),
  ]);

  await createAuditLog({
    adminId,
    action: 'logout_all',
    resourceType: 'auth',
    resourceId: adminId,
    requestId,
  });
}

export async function getAuthenticatedAdmin(adminId: string) {
  const admin = await AdminModel.findById(adminId);
  if (!admin) {
    throw new AppError(401, 'Administrator account no longer exists', 'ADMIN_NOT_FOUND');
  }
  return serializeAdmin(admin as AdminDocument);
}

export async function listAdminSessions(adminId: string) {
  const sessions = await AdminSessionModel.find({ adminId }).sort({ lastActivityAt: -1 }).lean();
  return sessions.map((session) => ({
    id: String(session._id),
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    isActive: session.isActive,
    createdAt: session.createdAt,
    lastActivityAt: session.lastActivityAt,
  }));
}

export async function revokeAdminSession(adminId: string, sessionId: string, requestId: string) {
  const session = await AdminSessionModel.findOne({ _id: sessionId, adminId });
  if (!session) {
    throw new AppError(404, 'Session not found', 'SESSION_NOT_FOUND');
  }

  await Promise.all([
    AdminSessionModel.updateOne({ _id: sessionId }, { $set: { isActive: false } }),
    RefreshTokenModel.updateMany(
      { sessionId, revokedAt: null },
      { $set: { revokedAt: new Date(), lastUsedAt: new Date() } },
    ),
  ]);

  await createAuditLog({
    adminId,
    action: 'revoke_session',
    resourceType: 'auth',
    resourceId: sessionId,
    requestId,
  });
}

export async function changeAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
  requestId: string,
) {
  const admin = await AdminModel.findById(adminId);
  if (!admin) {
    throw new AppError(404, 'Administrator account not found', 'ADMIN_NOT_FOUND');
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!isCurrentPasswordValid) {
    throw new AppError(400, 'Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await admin.save();

  await logoutAllSessions(adminId, requestId);

  await createAuditLog({
    adminId,
    action: 'change_password',
    resourceType: 'auth',
    resourceId: adminId,
    requestId,
  });
}
