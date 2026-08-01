import path from "node:path";
import { createHash } from "node:crypto";
import type { Request, Response } from "express";
import { fileTypeFromBuffer } from "file-type";
import { GridFSBucket, ObjectId } from "mongodb";
import mongoose, { Types } from "mongoose";
import multer from "multer";
import sharp from "sharp";
import type { MediaAssetDto, MediaBucket } from "@ankita-portfolio/shared-types";
import { getEnv } from "../config/env";
import { AppError } from "../errors/appError";
import { MediaAsset, type ImageVariant, type MediaAssetDocument } from "../models/mediaAsset";
import {
  Education,
  Experience,
  Interest,
  Profile,
  Project,
  Resume,
  Skill,
  Training
} from "../models/content";
import { recordAuditLog } from "./auditLog.service";
import { safeFilename } from "../utils/sanitize";

const imageMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
const pdfMimes = ["application/pdf"] as const;
const wordMimes = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
] as const;
const documentMimes = [
  "application/pdf",
  ...wordMimes
] as const;

type StoreBufferInput = {
  buffer: Buffer;
  originalName: string;
  declaredMimeType?: string | undefined;
  bucketName: MediaBucket;
  category: string;
  isPublic: boolean;
  altText?: string | undefined;
  caption?: string | undefined;
  associatedModel?: string | undefined;
  associatedDocumentId?: Types.ObjectId | undefined;
  uploadedBy?: Types.ObjectId | undefined;
};

type PreparedFile = {
  variant: ImageVariant;
  buffer: Buffer;
  extension: string;
  mimeType: string;
  width?: number;
  height?: number;
};

type GridFsFile = {
  _id: ObjectId;
  length: number;
  uploadDate: Date;
  filename: string;
  contentType?: string;
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: getEnv().MAX_DOCUMENT_MB * 1024 * 1024, files: 1 }
});

function getBucket(bucketName: MediaBucket): GridFSBucket {
  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(503, "DATABASE_NOT_READY", "Database connection is not ready");
  }
  return new GridFSBucket(db, { bucketName });
}

function allowedMimesForBucket(bucketName: MediaBucket): readonly string[] {
  if (bucketName === "resumes") {
    return [...pdfMimes, ...wordMimes];
  }
  if (bucketName === "documents") {
    return documentMimes;
  }
  if (bucketName === "certificates") {
    return [...imageMimes, ...pdfMimes];
  }
  return imageMimes;
}

function maxBytesForBucket(bucketName: MediaBucket): number {
  const env = getEnv();
  const mbByBucket: Record<MediaBucket, number> = {
    profileImages: env.MAX_PROFILE_IMAGE_MB,
    contentImages: env.MAX_CONTENT_IMAGE_MB,
    projectImages: env.MAX_CONTENT_IMAGE_MB,
    documents: env.MAX_DOCUMENT_MB,
    resumes: env.MAX_RESUME_MB,
    certificates: env.MAX_CERTIFICATE_MB,
    logos: env.MAX_PROFILE_IMAGE_MB
  };
  return mbByBucket[bucketName] * 1024 * 1024;
}

function normaliseExt(ext: string): string {
  const cleaned = ext.toLowerCase().replace(/^\./, "");
  return cleaned === "jpeg" ? "jpg" : cleaned;
}

function extensionMatches(detectedExt: string, originalName: string): boolean {
  const originalExt = normaliseExt(path.extname(originalName));
  const expected = normaliseExt(detectedExt);
  if (!originalExt) {
    return false;
  }
  return originalExt === expected || (expected === "jpg" && originalExt === "jpeg");
}

function checksum(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

async function validateInput(input: StoreBufferInput): Promise<{
  mimeType: string;
  extension: string;
  detectedSignature: string;
}> {
  if (input.buffer.length > maxBytesForBucket(input.bucketName)) {
    throw new AppError(413, "FILE_TOO_LARGE", "Uploaded file exceeds the configured size limit");
  }

  const detected = await fileTypeFromBuffer(input.buffer);
  if (!detected) {
    throw new AppError(400, "UNKNOWN_FILE_TYPE", "File type could not be verified");
  }

  const allowedMimes = allowedMimesForBucket(input.bucketName);
  if (!allowedMimes.includes(detected.mime)) {
    throw new AppError(400, "UNSUPPORTED_FILE_TYPE", `Unsupported file type: ${detected.mime}`);
  }

  if (!extensionMatches(detected.ext, input.originalName)) {
    throw new AppError(400, "EXTENSION_MISMATCH", "File extension does not match the detected file type");
  }

  if (input.declaredMimeType && input.declaredMimeType !== "application/octet-stream") {
    const declaredFamily = input.declaredMimeType.split("/")[0];
    const detectedFamily = detected.mime.split("/")[0];
    if (declaredFamily !== detectedFamily) {
      throw new AppError(400, "MIME_MISMATCH", "Declared MIME type does not match file signature");
    }
  }

  return {
    mimeType: detected.mime,
    extension: normaliseExt(detected.ext),
    detectedSignature: `${detected.mime}; ext=${detected.ext}`
  };
}

async function prepareImageVariants(
  buffer: Buffer,
  mimeType: string,
  extension: string,
): Promise<PreparedFile[]> {
  const image = sharp(buffer, { failOn: "error" }).rotate();
  const originalMetadata = await image.metadata();
  const originalBuffer = await image.clone().toBuffer();
  const prepared: PreparedFile[] = [
    {
      variant: "original",
      buffer: originalBuffer,
      extension,
      mimeType,
      width: originalMetadata.width,
      height: originalMetadata.height
    }
  ];

  const sizes: Array<{ variant: ImageVariant; width: number }> = [
    { variant: "thumbnail", width: 320 },
    { variant: "small", width: 640 },
    { variant: "medium", width: 960 },
    { variant: "large", width: 1440 }
  ];

  for (const size of sizes) {
    const variant = await sharp(buffer, { failOn: "error" })
      .rotate()
      .resize({ width: size.width, withoutEnlargement: true })
      .webp({ quality: size.variant === "thumbnail" ? 72 : 82 })
      .toBuffer({ resolveWithObject: true });

    prepared.push({
      variant: size.variant,
      buffer: variant.data,
      extension: "webp",
      mimeType: "image/webp",
      width: variant.info.width,
      height: variant.info.height
    });
  }

  return prepared;
}

async function storeGridFsFile(
  bucketName: MediaBucket,
  file: PreparedFile,
  originalName: string,
  parentAsset?: Types.ObjectId,
): Promise<Types.ObjectId> {
  const bucket = getBucket(bucketName);
  const storedName = `${new Types.ObjectId().toString()}-${file.variant}.${file.extension}`;
  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(storedName, {
      contentType: file.mimeType,
      metadata: {
        originalName,
        variant: file.variant,
        checksum: checksum(file.buffer),
        parentAsset: parentAsset?.toString()
      }
    });
    stream.on("error", reject);
    stream.on("finish", () => resolve(new Types.ObjectId(stream.id.toString())));
    stream.end(file.buffer);
  });
}

async function createAsset(
  input: StoreBufferInput,
  prepared: PreparedFile,
  originalValidation: { detectedSignature: string },
  parentAsset?: Types.ObjectId,
): Promise<MediaAssetDocument> {
  const gridFsFileId = await storeGridFsFile(input.bucketName, prepared, input.originalName, parentAsset);
  return MediaAsset.create({
    gridFsFileId,
    parentAsset,
    bucketName: input.bucketName,
    originalName: safeFilename(input.originalName),
    storedName: `${gridFsFileId.toString()}-${prepared.variant}.${prepared.extension}`,
    extension: prepared.extension,
    mimeType: prepared.mimeType,
    detectedSignature: originalValidation.detectedSignature,
    size: prepared.buffer.length,
    width: prepared.width,
    height: prepared.height,
    variant: prepared.variant,
    altText: input.altText,
    caption: input.caption,
    category: input.category,
    associatedModel: input.associatedModel,
    associatedDocumentId: input.associatedDocumentId,
    uploadedBy: input.uploadedBy,
    isPublic: input.isPublic,
    checksum: checksum(prepared.buffer)
  });
}

export async function storeBufferInGridFs(input: StoreBufferInput): Promise<MediaAssetDocument[]> {
  const validation = await validateInput(input);
  const isImage = imageMimes.includes(validation.mimeType as (typeof imageMimes)[number]);
  const preparedFiles = isImage
    ? await prepareImageVariants(input.buffer, validation.mimeType, validation.extension)
    : [
        {
          variant: "original" as const,
          buffer: input.buffer,
          extension: validation.extension,
          mimeType: validation.mimeType
        }
      ];

  const original = preparedFiles.find((file) => file.variant === "original");
  if (!original) {
    throw new AppError(500, "MEDIA_PREPARATION_FAILED", "Original media variant was not prepared");
  }

  const originalAsset = await createAsset(input, original, validation);
  const assets = [originalAsset];

  for (const prepared of preparedFiles.filter((file) => file.variant !== "original")) {
    assets.push(await createAsset(input, prepared, validation, originalAsset._id));
  }

  return assets;
}

export function toMediaDto(asset: MediaAssetDocument | Record<string, unknown> | null | undefined): MediaAssetDto | undefined {
  if (!asset) {
    return undefined;
  }
  const record = asset as Record<string, unknown>;
  const id = record._id instanceof Types.ObjectId ? record._id.toString() : String(record._id);
  return {
    id,
    bucketName: record.bucketName as MediaBucket,
    originalName: String(record.originalName ?? ""),
    storedName: String(record.storedName ?? ""),
    extension: String(record.extension ?? ""),
    mimeType: String(record.mimeType ?? ""),
    detectedSignature: String(record.detectedSignature ?? ""),
    size: Number(record.size ?? 0),
    width: typeof record.width === "number" ? record.width : undefined,
    height: typeof record.height === "number" ? record.height : undefined,
    variant: (record.variant as MediaAssetDto["variant"]) ?? "original",
    altText: typeof record.altText === "string" ? record.altText : undefined,
    caption: typeof record.caption === "string" ? record.caption : undefined,
    category: String(record.category ?? ""),
    associatedModel: typeof record.associatedModel === "string" ? record.associatedModel : undefined,
    associatedDocumentId:
      record.associatedDocumentId instanceof Types.ObjectId
        ? record.associatedDocumentId.toString()
        : typeof record.associatedDocumentId === "string"
          ? record.associatedDocumentId
          : undefined,
    isPublic: Boolean(record.isPublic),
    checksum: String(record.checksum ?? ""),
    createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : String(record.createdAt ?? ""),
    updatedAt: record.updatedAt instanceof Date ? record.updatedAt.toISOString() : String(record.updatedAt ?? "")
  };
}

async function resolveAssetForStream(assetId: string, variant?: string): Promise<MediaAssetDocument> {
  const asset = await MediaAsset.findOne({
    _id: assetId,
    isDeleted: false
  });
  if (!asset) {
    throw new AppError(404, "MEDIA_NOT_FOUND", "Media asset was not found");
  }

  if (variant && variant !== "original") {
    const variantAsset = await MediaAsset.findOne({
      parentAsset: asset._id,
      variant,
      isDeleted: false
    });
    return variantAsset ?? asset;
  }

  return asset;
}

async function getGridFsFile(asset: MediaAssetDocument): Promise<GridFsFile> {
  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(503, "DATABASE_NOT_READY", "Database connection is not ready");
  }
  const file = await db
    .collection<GridFsFile>(`${asset.bucketName}.files`)
    .findOne({ _id: new ObjectId(asset.gridFsFileId.toString()) });
  if (!file) {
    throw new AppError(404, "GRIDFS_FILE_NOT_FOUND", "GridFS file was not found");
  }
  return file;
}

function parseRange(range: string | undefined, length: number): { start: number; end: number } | null {
  if (!range) {
    return null;
  }
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) {
    return null;
  }
  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : length - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= length) {
    return null;
  }
  return { start, end };
}

export async function streamMedia(
  req: Request,
  res: Response,
  assetId: string,
  options: { publicOnly: boolean; disposition?: "inline" | "attachment" },
): Promise<void> {
  const asset = await resolveAssetForStream(assetId, String(req.query.variant ?? "original"));
  if (options.publicOnly && !asset.isPublic) {
    throw new AppError(404, "MEDIA_NOT_FOUND", "Media asset was not found");
  }
  const file = await getGridFsFile(asset);
  const bucket = getBucket(asset.bucketName);
  const etag = `"${asset.checksum}"`;
  const range = parseRange(req.headers.range, file.length);
  const disposition = options.disposition ?? "inline";

  res.setHeader("Content-Type", asset.mimeType);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("ETag", etag);
  res.setHeader("Last-Modified", file.uploadDate.toUTCString());
  res.setHeader("Cache-Control", asset.isPublic ? "public, max-age=31536000, immutable" : "private, no-store");
  res.setHeader("Content-Disposition", `${disposition}; filename="${safeFilename(asset.originalName)}"`);

  if (req.headers["if-none-match"] === etag) {
    res.status(304).end();
    return;
  }

  const streamOptions = range ? { start: range.start, end: range.end + 1 } : undefined;
  if (range) {
    res.status(206);
    res.setHeader("Content-Range", `bytes ${range.start}-${range.end}/${file.length}`);
    res.setHeader("Content-Length", range.end - range.start + 1);
  } else {
    res.setHeader("Content-Length", file.length);
  }

  const stream = bucket.openDownloadStream(new ObjectId(asset.gridFsFileId.toString()), streamOptions);
  stream.on("error", () => {
    if (!res.headersSent) {
      res.status(500).json({ error: { code: "STREAM_ERROR", message: "Unable to stream file" } });
    } else {
      res.destroy();
    }
  });
  stream.pipe(res);
}

async function contentReferenceCount(assetId: Types.ObjectId): Promise<number> {
  const id = assetId;
  const counts = await Promise.all([
    Profile.countDocuments({
      $or: [
        { profileImage: id },
        { heroImage: id },
        { aboutImage: id },
        { logo: id },
        { favicon: id },
        { openGraphImage: id }
      ]
    }),
    Experience.countDocuments({ organisationLogo: id }),
    Education.countDocuments({ $or: [{ institutionLogo: id }, { supportingDocument: id }] }),
    Training.countDocuments({ $or: [{ certificateImage: id }, { certificatePdf: id }, { organisationLogo: id }] }),
    Skill.countDocuments({ logoImage: id }),
    Interest.countDocuments({ image: id }),
    Project.countDocuments({
      $or: [{ thumbnail: id }, { galleryImages: id }, { supportingDocuments: id }, { openGraphImage: id }]
    }),
    Resume.countDocuments({ mediaAsset: id })
  ]);
  return counts.reduce((sum, count) => sum + count, 0);
}

export async function deleteAssetAndVariants(
  assetId: string,
  adminId?: Types.ObjectId,
  requestId?: string,
  force = false,
): Promise<void> {
  const asset = await MediaAsset.findById(assetId);
  if (!asset || asset.isDeleted) {
    throw new AppError(404, "MEDIA_NOT_FOUND", "Media asset was not found");
  }

  const rootAssetId = asset.parentAsset ?? asset._id;
  if (!force) {
    const references = await contentReferenceCount(rootAssetId);
    if (references > 0) {
      throw new AppError(409, "MEDIA_IN_USE", "Media is still referenced by portfolio content");
    }
  }

  const assets = await MediaAsset.find({
    $or: [{ _id: rootAssetId }, { parentAsset: rootAssetId }],
    isDeleted: false
  });

  for (const item of assets) {
    const bucket = getBucket(item.bucketName);
    try {
      await bucket.delete(new ObjectId(item.gridFsFileId.toString()));
    } catch {
      // The MediaAsset is still marked deleted so cleanup can reconcile missing GridFS files later.
    }
    item.isDeleted = true;
    item.deletedAt = new Date();
    await item.save();
  }

  await recordAuditLog({
    adminId,
    action: "file_deletion",
    resourceType: "MediaAsset",
    resourceId: rootAssetId,
    requestId
  });
}

export async function replaceMediaReferences(oldAssetId: Types.ObjectId, nextAssetId: Types.ObjectId): Promise<void> {
  await Promise.all([
    Profile.updateMany({ profileImage: oldAssetId }, { $set: { profileImage: nextAssetId } }),
    Profile.updateMany({ heroImage: oldAssetId }, { $set: { heroImage: nextAssetId } }),
    Profile.updateMany({ aboutImage: oldAssetId }, { $set: { aboutImage: nextAssetId } }),
    Profile.updateMany({ logo: oldAssetId }, { $set: { logo: nextAssetId } }),
    Profile.updateMany({ favicon: oldAssetId }, { $set: { favicon: nextAssetId } }),
    Profile.updateMany({ openGraphImage: oldAssetId }, { $set: { openGraphImage: nextAssetId } }),
    Experience.updateMany({ organisationLogo: oldAssetId }, { $set: { organisationLogo: nextAssetId } }),
    Education.updateMany({ institutionLogo: oldAssetId }, { $set: { institutionLogo: nextAssetId } }),
    Education.updateMany({ supportingDocument: oldAssetId }, { $set: { supportingDocument: nextAssetId } }),
    Training.updateMany({ certificateImage: oldAssetId }, { $set: { certificateImage: nextAssetId } }),
    Training.updateMany({ certificatePdf: oldAssetId }, { $set: { certificatePdf: nextAssetId } }),
    Training.updateMany({ organisationLogo: oldAssetId }, { $set: { organisationLogo: nextAssetId } }),
    Skill.updateMany({ logoImage: oldAssetId }, { $set: { logoImage: nextAssetId } }),
    Interest.updateMany({ image: oldAssetId }, { $set: { image: nextAssetId } }),
    Project.updateMany({ thumbnail: oldAssetId }, { $set: { thumbnail: nextAssetId } }),
    Project.updateMany({ openGraphImage: oldAssetId }, { $set: { openGraphImage: nextAssetId } }),
    Project.updateMany({ galleryImages: oldAssetId }, { $set: { "galleryImages.$": nextAssetId } }),
    Project.updateMany({ supportingDocuments: oldAssetId }, { $set: { "supportingDocuments.$": nextAssetId } }),
    Resume.updateMany({ mediaAsset: oldAssetId }, { $set: { mediaAsset: nextAssetId } })
  ]);
}

export async function listMediaAssets(query: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}): Promise<{ items: MediaAssetDto[]; total: number; page: number; limit: number }> {
  const filter: Record<string, unknown> = { isDeleted: false, variant: "original" };
  if (query.search) {
    filter.$or = [
      { originalName: new RegExp(query.search, "i") },
      { category: new RegExp(query.search, "i") },
      { altText: new RegExp(query.search, "i") }
    ];
  }
  if (query.status === "public") {
    filter.isPublic = true;
  }
  if (query.status === "private") {
    filter.isPublic = false;
  }
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    MediaAsset.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    MediaAsset.countDocuments(filter)
  ]);
  const mediaItems = items
    .map((item) => toMediaDto(item))
    .filter((item): item is MediaAssetDto => Boolean(item));
  return { items: mediaItems, total, page: query.page, limit: query.limit };
}

export async function storageStatistics(): Promise<{
  totalAssets: number;
  publicAssets: number;
  privateAssets: number;
  totalBytes: number;
  byBucket: Array<{ bucketName: string; count: number; bytes: number }>;
}> {
  const [summary] = await MediaAsset.aggregate<{
    totalAssets: number;
    publicAssets: number;
    privateAssets: number;
    totalBytes: number;
  }>([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalAssets: { $sum: 1 },
        publicAssets: { $sum: { $cond: ["$isPublic", 1, 0] } },
        privateAssets: { $sum: { $cond: ["$isPublic", 0, 1] } },
        totalBytes: { $sum: "$size" }
      }
    }
  ]);

  const byBucket = await MediaAsset.aggregate<{ bucketName: string; count: number; bytes: number }>([
    { $match: { isDeleted: false } },
    { $group: { _id: "$bucketName", count: { $sum: 1 }, bytes: { $sum: "$size" } } },
    { $project: { _id: 0, bucketName: "$_id", count: 1, bytes: 1 } },
    { $sort: { bucketName: 1 } }
  ]);

  return {
    totalAssets: summary?.totalAssets ?? 0,
    publicAssets: summary?.publicAssets ?? 0,
    privateAssets: summary?.privateAssets ?? 0,
    totalBytes: summary?.totalBytes ?? 0,
    byBucket
  };
}
