import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/app-error';
import { verifyAccessToken } from '../utils/auth';

function getBearerToken(request: Request): string | null {
  const authHeader = request.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice('Bearer '.length);
}

export function requireAuth(request: Request, _response: Response, next: NextFunction): void {
  const token = getBearerToken(request);
  if (!token) {
    next(new AppError(401, 'Authentication is required', 'AUTH_REQUIRED'));
    return;
  }

  try {
    request.auth = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, 'Session has expired or is invalid', 'INVALID_TOKEN'));
  }
}
