import { Schema, model, type Document, type Types } from "mongoose";
import type { MediaBucket } from "@ankita-portfolio/shared-types";

export type ImageVariant = "thumbnail" | "small" | "medium" | "large" | "original";

export interface MediaAssetDocument extends Document {
  _id: Types.ObjectId;
  gridFsFileId: Types.ObjectId;
  parentAsset?: Types.ObjectId;
  bucketName: MediaBucket;
  originalName: string;
  storedName: string;
  extension: string;
  mimeType: string;
  detectedSignature: string;
  size: number;
  width?: number;
  height?: number;
  variant: ImageVariant;
  altText?: string;
  caption?: string;
  category: string;
  associatedModel?: string;
  associatedDocumentId?: Types.ObjectId;
  uploadedBy?: Types.ObjectId;
  isPublic: boolean;
  checksum: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mediaAssetSchema = new Schema<MediaAssetDocument>(
  {
    gridFsFileId: { type: Schema.Types.ObjectId, required: true, index: true },
    parentAsset: { type: Schema.Types.ObjectId, ref: "MediaAsset", index: true },
    bucketName: {
      type: String,
      enum: ["profileImages", "contentImages", "projectImages", "documents", "resumes", "certificates", "logos"],
      required: true,
      index: true
    },
    originalName: { type: String, required: true, trim: true, maxlength: 240 },
    storedName: { type: String, required: true, trim: true, maxlength: 240 },
    extension: { type: String, required: true, trim: true, lowercase: true, maxlength: 12 },
    mimeType: { type: String, required: true, trim: true, maxlength: 120 },
    detectedSignature: { type: String, required: true, trim: true, maxlength: 80 },
    size: { type: Number, required: true, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    variant: {
      type: String,
      enum: ["thumbnail", "small", "medium", "large", "original"],
      default: "original",
      index: true
    },
    altText: { type: String, trim: true, maxlength: 240 },
    caption: { type: String, trim: true, maxlength: 500 },
    category: { type: String, required: true, trim: true, index: true, maxlength: 80 },
    associatedModel: { type: String, trim: true, maxlength: 120, index: true },
    associatedDocumentId: { type: Schema.Types.ObjectId, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    isPublic: { type: Boolean, default: false, index: true },
    checksum: { type: String, required: true, trim: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date }
  },
  { timestamps: true },
);

mediaAssetSchema.index({ parentAsset: 1, variant: 1 });
mediaAssetSchema.index({ bucketName: 1, isPublic: 1, isDeleted: 1 });

export const MediaAsset = model<MediaAssetDocument>("MediaAsset", mediaAssetSchema);
