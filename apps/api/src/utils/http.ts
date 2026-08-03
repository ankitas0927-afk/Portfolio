import type { Response } from 'express';

export function sendSuccess<T>(
  response: Response,
  data: T,
  meta?: Record<string, unknown>,
  statusCode = 200,
): void {
  response.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}
