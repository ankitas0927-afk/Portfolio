import { Schema, model, type Document, type Types } from "mongoose";

export interface AdminDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "owner" | "editor";
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<AdminDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "editor"], default: "owner", index: true },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date }
  },
  { timestamps: true },
);

export const Admin = model<AdminDocument>("Admin", adminSchema);
