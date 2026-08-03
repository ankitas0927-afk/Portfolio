import type { NextFunction, Request, Response } from 'express';

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !key.startsWith('$'))
        .map(([key, nestedValue]) => [key.replace(/\./g, '_'), sanitizeValue(nestedValue)]),
    );
  }

  return value;
}

export function sanitizeInputMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  request.body = sanitizeValue(request.body) as Request['body'];
  request.params = sanitizeValue(request.params) as Request['params'];
  next();
}
