import { AuditLogModel } from '../models/index';

export async function createAuditLog(input: {
  adminId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  requestId: string;
  metadata?: Record<string, unknown>;
}) {
  return AuditLogModel.create({
    adminId: input.adminId ?? null,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId ?? null,
    requestId: input.requestId,
    metadata: input.metadata ?? {},
  });
}
