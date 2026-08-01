import { Schema, model, type Document, type Types } from "mongoose";

export interface SessionDocument extends Document {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    refreshTokenHash: { type: String, required: true, unique: true, index: true },
    userAgent: { type: String, maxlength: 400 },
    ipAddress: { type: String, maxlength: 100 },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date }
  },
  { timestamps: true },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = model<SessionDocument>("Session", sessionSchema);
