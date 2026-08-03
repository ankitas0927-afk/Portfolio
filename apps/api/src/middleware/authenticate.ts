import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { AppError } from "../errors/appError.js";
import { verifyAccessToken } from "../services/auth.service.js";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
  if (!token) {
    next(new AppError(401, "UNAUTHENTICATED", "Administrator authentication is required"));
    return;
  }

  const payload = verifyAccessToken(token);
  req.admin = {
    id: new Types.ObjectId(payload.sub),
    email: payload.email,
    role: payload.role
  };
  next();
}

export function requireOwner(req: Request, _res: Response, next: NextFunction): void {
  if (req.admin?.role !== "owner") {
    next(new AppError(403, "FORBIDDEN", "Owner access is required"));
    return;
  }
  next();
}
