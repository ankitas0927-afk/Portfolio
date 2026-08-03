import type { Types } from "mongoose";
import { AuditLog } from "../models/auditLog.js";

type AuditInput = {
  adminId?: Types.ObjectId | undefined;
  action: string;
  resourceType: string;
  resourceId?: Types.ObjectId | undefined;
  requestId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
};

export async function recordAuditLog(input: AuditInput): Promise<void> {
  await AuditLog.create({
    adminId: input.adminId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    requestId: input.requestId,
    metadata: input.metadata ?? {}
  });
}

export async function listAuditLogs(query: {
  page: number;
  limit: number;
  search?: string;
}): Promise<{ items: Record<string, unknown>[]; total: number; page: number; limit: number }> {
  const filter: Record<string, unknown> = {};
  if (query.search) {
    filter.$or = [
      { action: new RegExp(query.search, "i") },
      { resourceType: new RegExp(query.search, "i") },
      { requestId: new RegExp(query.search, "i") }
    ];
  }
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    AuditLog.countDocuments(filter)
  ]);
  return {
    items: items.map((item) => ({
      id: item._id.toString(),
      adminId: item.adminId?.toString(),
      action: item.action,
      resourceType: item.resourceType,
      resourceId: item.resourceId?.toString(),
      requestId: item.requestId,
      metadata: item.metadata,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : ""
    })),
    total,
    page: query.page,
    limit: query.limit
  };
}
