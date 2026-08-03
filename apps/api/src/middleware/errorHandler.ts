import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/appError.js";
import { logger } from "../config/logger.js";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isProduction = process.env.NODE_ENV === "production";

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: error.flatten(),
        requestId: req.requestId
      }
    });
    return;
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error({ err: error, requestId: req.requestId }, "Application error");
    }
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: isProduction ? undefined : error.details,
        requestId: req.requestId
      }
    });
    return;
  }

  logger.error({ err: error, requestId: req.requestId }, "Unexpected server error");
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      details: isProduction ? undefined : { message: error.message },
      requestId: req.requestId
    }
  });
}
