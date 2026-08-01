import { Schema, model, type Document, type Types } from "mongoose";

export interface AuditLogDocument extends Document {
  _id: Types.ObjectId;
  adminId?: Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: Types.ObjectId;
  requestId?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", index: true },
    action: { type: String, required: true, trim: true, index: true },
    resourceType: { type: String, required: true, trim: true, index: true },
    resourceId: { type: Schema.Types.ObjectId, index: true },
    requestId: { type: String, maxlength: 120 },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<AuditLogDocument>("AuditLog", auditLogSchema);
