import { Readable } from 'stream';
import path from 'path';

import { GRIDFS_BUCKETS, IMAGE_VARIANTS } from '@ankita-portfolio/config';
import { AppError } from '../errors/app-error';
import { getGridFsBucket, getGridFsFileDocument, deleteGridFsFile } from '../database/gridfs';
import {
  MediaAssetModel,
  ResumeModel,
  mediaReferenceMap,
  type MediaAssetDocument,
} from '../models/index';
import type { MediaCategory, MediaVariant } from '@ankita-portfolio/shared-types';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import type { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';

import { env } from '../config/env';
import { createAuditLog } from './audit.service';
import { createChecksum, createStoredFilename } from '../utils/misc';
import { buildPublicMediaUrl } from '../utils/public-url';

type UploadMediaInput = {
  file: Express.Multer.File;
  category: MediaCategory;
  isPublic?: boolean;
  altText?: string;
  caption?: string;
  associatedModel?: string;
  associatedDocumentId?: string;
  adminId?: string;
  requestId: string;
};

type ResolvedUpload = {
  extension: string;
  detectedMimeType: string;
  bucketName: (typeof GRIDFS_BUCKETS)[keyof typeof GRIDFS_BUCKETS];
  sanitizedOriginalBuffer: Buffer;
  size: number;
  width?: number;
  height?: number;
  isImage: boolean;
  variants: Array<{ variant: Exclude<MediaVariant, 'original'>; buffer: Buffer; width?: number; height?: number }>;
};

const imageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/x-icon',
]);
const documentMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const iconMimeTypes = new Set(['image/x-icon']);
const documentCategoryExtensions = new Set(['pdf', 'doc', 'docx']);

function getOriginalExtension(fileName: string) {
  return path.extname(fileName).replace(/^\./, '').toLowerCase();
}

async function resolveDetectedFileType(file: Express.Multer.File) {
  const detected = await fileTypeFromBuffer(file.buffer);
  const originalExtension = getOriginalExtension(file.originalname);

  if (detected?.mime === 'application/x-cfb' && originalExtension === 'doc') {
    return {
      ext: 'doc',
      mime: 'application/msword',
    };
  }

  if (detected) {
    return detected;
  }

  if (originalExtension === 'doc' && ['application/msword', 'application/octet-stream'].includes(file.mimetype)) {
    return {
      ext: 'doc',
      mime: 'application/msword',
    };
  }

  return null;
}

function categoryToBucket(
  category: MediaCategory,
): (typeof GRIDFS_BUCKETS)[keyof typeof GRIDFS_BUCKETS] {
  switch (category) {
    case 'profile-image':
      return GRIDFS_BUCKETS.profileImages;
    case 'project-thumbnail':
    case 'project-gallery':
      return GRIDFS_BUCKETS.projectImages;
    case 'logo':
    case 'favicon':
    case 'og-image':
    case 'organisation-logo':
    case 'institution-logo':
      return GRIDFS_BUCKETS.logos;
    case 'resume':
      return GRIDFS_BUCKETS.resumes;
    case 'certificate-image':
    case 'certificate-pdf':
      return GRIDFS_BUCKETS.certificates;
    case 'document':
      return GRIDFS_BUCKETS.documents;
    case 'hero-image':
    case 'about-image':
    default:
      return GRIDFS_BUCKETS.contentImages;
  }
}

function getCategoryMaxSizeBytes(category: MediaCategory): number {
  switch (category) {
    case 'profile-image':
      return env.MAX_PROFILE_IMAGE_MB * 1024 * 1024;
    case 'resume':
      return env.MAX_RESUME_MB * 1024 * 1024;
    case 'certificate-pdf':
    case 'certificate-image':
      return env.MAX_CERTIFICATE_MB * 1024 * 1024;
    case 'document':
      return env.MAX_DOCUMENT_MB * 1024 * 1024;
    default:
      return env.MAX_CONTENT_IMAGE_MB * 1024 * 1024;
  }
}

function isImageCategory(category: MediaCategory): boolean {
  return !['resume', 'document', 'certificate-pdf'].includes(category);
}

async function uploadBufferToGridFs(
  bucketName: (typeof GRIDFS_BUCKETS)[keyof typeof GRIDFS_BUCKETS],
  buffer: Buffer,
  storedName: string,
  mimeType: string,
) {
  const bucket = getGridFsBucket(bucketName);
  const uploadStream = bucket.openUploadStream(storedName, {
    contentType: mimeType,
  });

  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => resolve());
  });

  return uploadStream.id as Types.ObjectId;
}

async function validateAndTransformFile(input: UploadMediaInput): Promise<ResolvedUpload> {
  const { file, category } = input;

  if (!file?.buffer || file.buffer.length === 0) {
    throw new AppError(400, 'Uploaded file is empty', 'EMPTY_FILE');
  }

  if (file.size > getCategoryMaxSizeBytes(category)) {
    throw new AppError(400, 'Uploaded file exceeds the configured size limit', 'FILE_TOO_LARGE');
  }

  const detected = await resolveDetectedFileType(file);
  if (!detected) {
    throw new AppError(400, 'Unable to detect a safe file signature', 'UNSUPPORTED_FILE');
  }

  const expectsImage = isImageCategory(category);
  const detectedMimeType = detected.mime;
  const detectedExtension = detected.ext.toLowerCase();

  if (expectsImage && !imageMimeTypes.has(detectedMimeType)) {
    throw new AppError(
      400,
      'Supported image formats here are JPG, JPEG, PNG, WebP, GIF, AVIF, and ICO.',
      'INVALID_IMAGE',
    );
  }

  if (!expectsImage && (!documentMimeTypes.has(detectedMimeType) || !documentCategoryExtensions.has(detectedExtension))) {
    throw new AppError(400, 'Supported document formats here are PDF, DOC, and DOCX.', 'INVALID_DOCUMENT');
  }

  if (iconMimeTypes.has(detectedMimeType) && !['favicon', 'logo'].includes(category)) {
    throw new AppError(400, 'ICO files are only allowed for logo and favicon uploads.', 'INVALID_IMAGE');
  }

  const bucketName = categoryToBucket(category);

  if (!expectsImage) {
    return {
      extension: detectedExtension,
      detectedMimeType,
      bucketName,
      sanitizedOriginalBuffer: file.buffer,
      size: file.buffer.length,
      isImage: false,
      variants: [],
    };
  }

  if (iconMimeTypes.has(detectedMimeType)) {
    return {
      extension: detectedExtension,
      detectedMimeType,
      bucketName,
      sanitizedOriginalBuffer: file.buffer,
      size: file.buffer.length,
      isImage: true,
      variants: [],
    };
  }

  const sharpOptions = {
    failOnError: true,
    animated: detectedMimeType === 'image/gif',
  } as const;
  const metadata = await sharp(file.buffer, sharpOptions).metadata();
  const width = metadata.width;
  const height = metadata.height;

  const sanitizedOriginalBuffer =
    detectedMimeType === 'image/png'
      ? await sharp(file.buffer, sharpOptions).rotate().png({ compressionLevel: 9 }).toBuffer()
      : detectedMimeType === 'image/webp'
        ? await sharp(file.buffer, sharpOptions)
            .rotate()
            .webp({ quality: IMAGE_VARIANTS.original.quality })
            .toBuffer()
        : detectedMimeType === 'image/avif'
          ? await sharp(file.buffer, sharpOptions)
              .rotate()
              .avif({ quality: IMAGE_VARIANTS.original.quality })
              .toBuffer()
          : detectedMimeType === 'image/gif'
            ? file.buffer
        : await sharp(file.buffer)
            .rotate()
            .jpeg({ quality: IMAGE_VARIANTS.original.quality, mozjpeg: true })
            .toBuffer();

  const variants: ResolvedUpload['variants'] = [];
  for (const [variant, config] of Object.entries(IMAGE_VARIANTS)) {
    if (variant === 'original' || !config.width) {
      continue;
    }

    const transformed = await sharp(file.buffer, sharpOptions)
      .rotate()
      .resize({ width: config.width, withoutEnlargement: true })
      .webp({ quality: config.quality })
      .toBuffer({ resolveWithObject: true });

    variants.push({
      variant: variant as Exclude<MediaVariant, 'original'>,
      buffer: transformed.data,
      width: transformed.info.width,
      height: transformed.info.height,
    });
  }

  return {
    extension: detectedExtension,
    detectedMimeType,
    bucketName,
    sanitizedOriginalBuffer,
    size: sanitizedOriginalBuffer.length,
    width,
    height,
    isImage: true,
    variants,
  };
}

async function createMediaAssetRecord(input: {
  gridFsFileId: Types.ObjectId;
  bucketName: string;
  originalName: string;
  storedName: string;
  extension: string;
  mimeType: string;
  detectedMimeType: string;
  size: number;
  width?: number;
  height?: number;
  variant: MediaVariant;
  category: MediaCategory;
  sourceAssetId?: Types.ObjectId | null;
  isPublic: boolean;
  altText?: string;
  caption?: string;
  associatedModel?: string;
  associatedDocumentId?: string;
  uploadedByAdminId?: string;
  checksum: string;
}) {
  return MediaAssetModel.create({
    gridFsFileId: input.gridFsFileId,
    bucketName: input.bucketName,
    originalName: input.originalName,
    storedName: input.storedName,
    extension: input.extension,
    mimeType: input.mimeType,
    detectedMimeType: input.detectedMimeType,
    size: input.size,
    width: input.width,
    height: input.height,
    variant: input.variant,
    sourceAssetId: input.sourceAssetId ?? null,
    altText: input.altText,
    caption: input.caption,
    category: input.category,
    associatedModel: input.associatedModel,
    associatedDocumentId: input.associatedDocumentId ?? null,
    uploadedByAdminId: input.uploadedByAdminId ?? null,
    isPublic: input.isPublic,
    checksum: input.checksum,
  });
}

export async function uploadMedia(input: UploadMediaInput) {
  const transformed = await validateAndTransformFile(input);
  const storedName = createStoredFilename(input.file.originalname);
  const gridFsFileId = await uploadBufferToGridFs(
    transformed.bucketName,
    transformed.sanitizedOriginalBuffer,
    storedName,
    transformed.detectedMimeType,
  );

  const sourceAsset = await createMediaAssetRecord({
    gridFsFileId,
    bucketName: transformed.bucketName,
    originalName: input.file.originalname,
    storedName,
    extension: transformed.extension,
    mimeType: transformed.detectedMimeType,
    detectedMimeType: transformed.detectedMimeType,
    size: transformed.size,
    width: transformed.width,
    height: transformed.height,
    variant: 'original',
    category: input.category,
    isPublic: input.isPublic ?? false,
    altText: input.altText,
    caption: input.caption,
    associatedModel: input.associatedModel,
    associatedDocumentId: input.associatedDocumentId,
    uploadedByAdminId: input.adminId,
    checksum: createChecksum(transformed.sanitizedOriginalBuffer),
  });

  const variants = [];

  for (const variant of transformed.variants) {
    const variantStoredName = storedName.replace(/\.[^.]+$/, `-${variant.variant}.webp`);
    const variantGridFsFileId = await uploadBufferToGridFs(
      transformed.bucketName,
      variant.buffer,
      variantStoredName,
      'image/webp',
    );

    variants.push(
      await createMediaAssetRecord({
        gridFsFileId: variantGridFsFileId,
        bucketName: transformed.bucketName,
        originalName: input.file.originalname,
        storedName: variantStoredName,
        extension: 'webp',
        mimeType: 'image/webp',
        detectedMimeType: 'image/webp',
        size: variant.buffer.length,
        width: variant.width,
        height: variant.height,
        variant: variant.variant,
        category: input.category,
        sourceAssetId: sourceAsset._id as Types.ObjectId,
        isPublic: input.isPublic ?? false,
        altText: input.altText,
        caption: input.caption,
        associatedModel: input.associatedModel,
        associatedDocumentId: input.associatedDocumentId,
        uploadedByAdminId: input.adminId,
        checksum: createChecksum(variant.buffer),
      }),
    );
  }

  await createAuditLog({
    adminId: input.adminId,
    action: 'upload_media',
    resourceType: 'media',
    resourceId: sourceAsset._id.toString(),
    requestId: input.requestId,
    metadata: { category: input.category, variantCount: variants.length },
  });

  return {
    asset: {
      ...sourceAsset.toJSON(),
      id: sourceAsset._id.toString(),
    },
    variants: variants.map((variant) => ({
      ...variant.toJSON(),
      id: variant._id.toString(),
    })),
  };
}

export async function getMediaAssetById(assetId: string, includeDeleted = false) {
  const query = includeDeleted ? { _id: assetId } : { _id: assetId, deletedAt: null };
  const asset = await MediaAssetModel.findOne(query);
  if (!asset) {
    throw new AppError(404, 'Media asset not found', 'MEDIA_NOT_FOUND');
  }
  return asset as MediaAssetDocument;
}

export async function resolveMediaAssetVariant(assetId: string, variant?: MediaVariant) {
  const asset = await getMediaAssetById(assetId);
  const sourceId = asset.sourceAssetId ?? asset._id;

  if (!variant || variant === 'original') {
    return asset.sourceAssetId ? getMediaAssetById(sourceId.toString()) : asset;
  }

  const variantAsset = await MediaAssetModel.findOne({
    sourceAssetId: sourceId,
    variant,
    deletedAt: null,
  });
  return (variantAsset as MediaAssetDocument | null) ?? asset;
}

export async function streamMediaAsset(options: {
  request: Request;
  response: Response;
  assetId: string;
  variant?: MediaVariant;
  download?: boolean;
}) {
  const asset = await resolveMediaAssetVariant(options.assetId, options.variant);
  const fileDocument = await getGridFsFileDocument(
    asset.bucketName as (typeof GRIDFS_BUCKETS)[keyof typeof GRIDFS_BUCKETS],
    asset.gridFsFileId as Types.ObjectId,
  );

  if (!fileDocument) {
    throw new AppError(404, 'File data was not found in GridFS', 'GRIDFS_FILE_MISSING');
  }

  const ifNoneMatch = options.request.headers['if-none-match'];
  if (ifNoneMatch === asset.checksum) {
    options.response.status(304).end();
    return;
  }

  const totalSize = fileDocument.length as number;
  let start = 0;
  let end = totalSize - 1;
  let statusCode = 200;

  const rangeHeader = options.request.headers.range;
  if (typeof rangeHeader === 'string' && rangeHeader.startsWith('bytes=')) {
    const [startPart, endPart] = rangeHeader.replace('bytes=', '').split('-');
    start = startPart ? Number.parseInt(startPart, 10) : 0;
    end = endPart ? Number.parseInt(endPart, 10) : totalSize - 1;
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= totalSize) {
      throw new AppError(416, 'Requested byte range is invalid', 'INVALID_RANGE');
    }
    statusCode = 206;
  }

  options.response.status(statusCode);
  options.response.setHeader('Content-Type', asset.mimeType);
  options.response.setHeader('Content-Length', end - start + 1);
  options.response.setHeader(
    'Content-Disposition',
    `${options.download ? 'attachment' : 'inline'}; filename="${encodeURIComponent(asset.originalName)}"`,
  );
  options.response.setHeader(
    'Cache-Control',
    asset.isPublic ? 'public, max-age=3600, stale-while-revalidate=86400' : 'private, no-store',
  );
  options.response.setHeader('ETag', asset.checksum);
  options.response.setHeader('Last-Modified', new Date(asset.updatedAt).toUTCString());
  options.response.setHeader('Accept-Ranges', 'bytes');
  if (statusCode === 206) {
    options.response.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
  }

  const bucket = getGridFsBucket(asset.bucketName as (typeof GRIDFS_BUCKETS)[keyof typeof GRIDFS_BUCKETS]);
  const stream = bucket.openDownloadStream(asset.gridFsFileId as Types.ObjectId, {
    start,
    end: end + 1,
  });

  await new Promise<void>((resolve, reject) => {
    stream.on('error', reject);
    stream.on('end', resolve);
    stream.pipe(options.response);
  });
}

export async function listMediaAssets(query: {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  isPublic?: boolean;
}) {
  const filter: Record<string, unknown> = {
    deletedAt: null,
  };

  if (query.category) {
    filter.category = query.category;
  }

  if (typeof query.isPublic === 'boolean') {
    filter.isPublic = query.isPublic;
  }

  if (query.search) {
    filter.$or = [
      { originalName: { $regex: query.search, $options: 'i' } },
      { altText: { $regex: query.search, $options: 'i' } },
      { caption: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [totalItems, items] = await Promise.all([
    MediaAssetModel.countDocuments(filter),
    MediaAssetModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      id: String(item._id),
      publicUrl: buildPublicMediaUrl(String(item._id)),
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / query.limit),
    },
  };
}

export async function updateMediaMetadata(
  assetId: string,
  input: {
    altText?: string;
    caption?: string;
    category?: string;
    isPublic?: boolean;
    associatedModel?: string;
    associatedDocumentId?: string;
  },
  adminId: string,
  requestId: string,
) {
  const asset = await getMediaAssetById(assetId);
  Object.assign(asset, input);
  await asset.save();

  await createAuditLog({
    adminId,
    action: 'update_media',
    resourceType: 'media',
    resourceId: assetId,
    requestId,
  });

  return asset.toJSON();
}

async function replaceReferencesInArray(
  model: mongoose.Model<Record<string, unknown>>,
  arrayField: string,
  oldId: string,
  newId: string,
) {
  const docs = await model.find({ [arrayField]: oldId });
  await Promise.all(
    docs.map(async (doc) => {
      const arrayValue = ((doc as mongoose.Document).get(arrayField) as Types.ObjectId[] | undefined) ?? [];
      const updated = arrayValue.map((item) => (String(item) === oldId ? new Types.ObjectId(newId) : item));
      (doc as mongoose.Document).set(arrayField, updated);
      await doc.save();
    }),
  );
}

async function replaceMediaReferences(oldId: string, newId: string) {
  for (const mapping of mediaReferenceMap) {
    for (const field of mapping.fields) {
      await mapping.model.updateMany({ [field]: oldId }, { $set: { [field]: newId } });
    }
    for (const arrayField of mapping.arrayFields ?? []) {
      await replaceReferencesInArray(mapping.model, arrayField, oldId, newId);
    }
  }
}

async function collectReferencedMediaIds(): Promise<Set<string>> {
  const referencedIds = new Set<string>();
  for (const mapping of mediaReferenceMap) {
    const docs = await mapping.model.find({}).lean();
    for (const doc of docs as Array<Record<string, unknown>>) {
      for (const field of mapping.fields) {
        const value = doc[field];
        if (value) {
          referencedIds.add(String(value));
        }
      }
      for (const arrayField of mapping.arrayFields ?? []) {
        const values = doc[arrayField];
        if (Array.isArray(values)) {
          values.forEach((value) => referencedIds.add(String(value)));
        }
      }
    }
  }
  return referencedIds;
}

async function deleteMediaFamily(asset: MediaAssetDocument) {
  const sourceId = asset.sourceAssetId ?? asset._id;
  const assets = await MediaAssetModel.find({
    $or: [{ _id: sourceId }, { sourceAssetId: sourceId }],
  });

  await Promise.all(
    assets.map(async (familyMember) => {
      await deleteGridFsFile(
        familyMember.bucketName as (typeof GRIDFS_BUCKETS)[keyof typeof GRIDFS_BUCKETS],
        familyMember.gridFsFileId as Types.ObjectId,
      );
      familyMember.deletedAt = new Date();
      await familyMember.save();
    }),
  );
}

export async function deleteMediaAsset(assetId: string, adminId: string, requestId: string) {
  const asset = await getMediaAssetById(assetId);
  const referencedIds = await collectReferencedMediaIds();
  const sourceId = String(asset.sourceAssetId ?? asset._id);

  if (referencedIds.has(assetId) || referencedIds.has(sourceId)) {
    throw new AppError(
      409,
      'This media asset is still in use by portfolio content and cannot be deleted yet',
      'MEDIA_IN_USE',
    );
  }

  await deleteMediaFamily(asset);

  await createAuditLog({
    adminId,
    action: 'delete_media',
    resourceType: 'media',
    resourceId: assetId,
    requestId,
  });
}

export async function replaceMediaAsset(
  assetId: string,
  file: Express.Multer.File,
  adminId: string,
  requestId: string,
) {
  const oldAsset = await getMediaAssetById(assetId);
  const uploadResult = await uploadMedia({
    file,
    category: oldAsset.category as MediaCategory,
    isPublic: oldAsset.isPublic,
    altText: oldAsset.altText ?? undefined,
    caption: oldAsset.caption ?? undefined,
    associatedModel: oldAsset.associatedModel ?? undefined,
    associatedDocumentId: oldAsset.associatedDocumentId?.toString(),
    adminId,
    requestId,
  });

  await replaceMediaReferences(assetId, uploadResult.asset.id as string);
  if (oldAsset.associatedModel === 'Resume') {
    await ResumeModel.updateMany({ mediaAssetId: assetId }, { $set: { mediaAssetId: uploadResult.asset.id } });
  }
  await deleteMediaFamily(oldAsset);

  await createAuditLog({
    adminId,
    action: 'replace_media',
    resourceType: 'media',
    resourceId: assetId,
    requestId,
    metadata: { newAssetId: uploadResult.asset.id },
  });

  return uploadResult;
}

export async function cleanupOrphanedMedia(adminId: string, requestId: string) {
  const referencedIds = await collectReferencedMediaIds();
  const mediaAssets = await MediaAssetModel.find({ deletedAt: null });

  const orphanedAssets = mediaAssets.filter((asset) => {
    const id = asset._id.toString();
    const sourceId = asset.sourceAssetId?.toString();
    return !referencedIds.has(id) && !(sourceId && referencedIds.has(sourceId));
  });

  let deletedCount = 0;
  for (const asset of orphanedAssets) {
    if (asset.sourceAssetId) {
      continue;
    }
    await deleteMediaFamily(asset as MediaAssetDocument);
    deletedCount += 1;
  }

  await createAuditLog({
    adminId,
    action: 'cleanup_media',
    resourceType: 'media',
    requestId,
    metadata: { deletedCount },
  });

  return {
    deletedCount,
    orphanedSourceAssetIds: orphanedAssets
      .filter((asset) => !asset.sourceAssetId)
      .map((asset) => asset._id.toString()),
  };
}

export async function getMediaStorageStatistics() {
  const stats = await MediaAssetModel.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: '$bucketName',
        totalFiles: { $sum: 1 },
        totalBytes: { $sum: '$size' },
      },
    },
    { $sort: { totalBytes: -1 } },
  ]);

  return stats.map((entry) => ({
    bucketName: entry._id,
    totalFiles: entry.totalFiles,
    totalBytes: entry.totalBytes,
  }));
}
