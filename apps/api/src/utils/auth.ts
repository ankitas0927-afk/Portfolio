import { createHash, randomBytes, randomUUID } from 'crypto';

import jwt, { type SignOptions } from 'jsonwebtoken';
import ms from 'ms';

import { env } from '../config/env.js';

export interface JwtPayload {
  adminId: string;
  sessionId?: string;
  refreshTokenId?: string;
  role: 'owner';
}

export function hashToken(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function generateOpaqueToken(): string {
  return `${randomUUID()}-${randomBytes(24).toString('hex')}`;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

export function getRefreshTokenMaxAgeMs(): number {
  return ms(env.JWT_REFRESH_EXPIRES_IN as ms.StringValue);
}
