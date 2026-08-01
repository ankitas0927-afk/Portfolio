import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../errors/appError";

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(new AppError(400, "VALIDATION_ERROR", "Request body validation failed", parsed.error.flatten()));
      return;
    }
    req.body = parsed.data as unknown;
    next();
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      next(new AppError(400, "VALIDATION_ERROR", "Query validation failed", parsed.error.flatten()));
      return;
    }
    req.query = parsed.data as Request["query"];
    next();
  };
}
