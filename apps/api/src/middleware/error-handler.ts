import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { logger } from '../config/logger.js';
import { AppError } from '../errors/app-error.js';

export function notFoundMiddleware(request: Request, response: Response): void {
  response.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${request.method} ${request.originalUrl} was not found`,
      requestId: request.requestId,
    },
  });
}

export function errorHandler(
  error: unknown,
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  void next;

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        requestId: request.requestId,
        details: {
          issues: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        requestId: request.requestId,
        details: error.details,
      },
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    response.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'One of the supplied identifiers is invalid',
        requestId: request.requestId,
      },
    });
    return;
  }

  logger.error(
    {
      error,
      requestId: request.requestId,
      method: request.method,
      path: request.originalUrl,
    },
    'Unhandled request error',
  );

  response.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      requestId: request.requestId,
    },
  });
}
