import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { paginationSchema, publicationStatusSchema } from "@ankita-portfolio/validation";
import { AppError } from "../errors/appError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateQuery } from "../middleware/validate.js";
import {
  ContactMessage,
  Education,
  Experience,
  Project,
  Resume,
  Skill,
  Training
} from "../models/content.js";
import { MediaAsset } from "../models/mediaAsset.js";
import {
  createContent,
  deleteContent,
  getContent,
  getSingletonProfile,
  listContent,
  type ContentResource,
  updateContent,
  upsertSingletonProfile
} from "../services/content.service.js";
import { getFooterSettings, upsertFooterSettings } from "../services/footerSettings.service.js";
import {
  deleteAssetAndVariants,
  listMediaAssets,
  storageStatistics,
  storeBufferInGridFs,
  streamMedia,
  toMediaDto,
  replaceMediaReferences,
  upload
} from "../services/media.service.js";
import {
  deleteContactMessage,
  exportContactMessagesCsv,
  listContactMessages,
  updateContactStatus
} from "../services/portfolio.service.js";
import { listAuditLogs } from "../services/auditLog.service.js";
import { recordAuditLog } from "../services/auditLog.service.js";

export const adminRouter = Router();

adminRouter.use(authenticate);

const resourceSchema = z.enum([
  "experiences",
  "education",
  "training",
  "skill-categories",
  "skills",
  "personal-skills",
  "languages",
  "interests",
  "projects"
]);

const mediaUploadBodySchema = z.object({
  bucketName: z.enum(["profileImages", "contentImages", "projectImages", "documents", "resumes", "certificates", "logos"]),
  category: z.string().trim().min(2).max(80).default("content"),
  isPublic: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .default(false)
    .transform((value) => value === true || value === "true"),
  altText: z.string().trim().max(240).optional().or(z.literal("")),
  caption: z.string().trim().max(500).optional().or(z.literal("")),
  associatedModel: z.string().trim().max(120).optional().or(z.literal("")),
  associatedDocumentId: z.string().regex(/^[a-f\d]{24}$/i).optional().or(z.literal(""))
});

const contactStatusSchema = z.object({
  status: z.enum(["unread", "read", "replied", "archived"])
});

function multipartBoolean(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => item === true || item === "true");
  }
  return value === true || value === "true";
}

function assertFile(file: Express.Multer.File | undefined): Express.Multer.File {
  if (!file) {
    throw new AppError(400, "FILE_REQUIRED", "A file upload is required");
  }
  return file;
}

function requireObjectId(id: string | undefined): string {
  if (!id) {
    throw new AppError(400, "INVALID_ID", "Invalid MongoDB object ID");
  }
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "INVALID_ID", "Invalid MongoDB object ID");
  }
  return id;
}

function requireResource(resource: string | undefined): ContentResource {
  return resourceSchema.parse(resource) as ContentResource;
}

function firstAsset(assets: Awaited<ReturnType<typeof storeBufferInGridFs>>) {
  const asset = assets[0];
  if (!asset) {
    throw new AppError(500, "MEDIA_UPLOAD_FAILED", "Media upload did not produce an asset");
  }
  return asset;
}

adminRouter.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const [experiences, education, training, skills, projects, media, unreadMessages] = await Promise.all([
      Experience.countDocuments(),
      Education.countDocuments(),
      Training.countDocuments(),
      Skill.countDocuments(),
      Project.countDocuments(),
      MediaAsset.countDocuments({ isDeleted: false, variant: "original" }),
      ContactMessage.countDocuments({ status: "unread" })
    ]);
    res.json({ experiences, education, training, skills, projects, media, unreadMessages });
  }),
);

adminRouter.get(
  "/profile",
  asyncHandler(async (_req, res) => {
    res.json({ profile: await getSingletonProfile() });
  }),
);

adminRouter.patch(
  "/profile",
  asyncHandler(async (req, res) => {
    res.json({ profile: await upsertSingletonProfile(req.body, req.admin!.id, req.requestId) });
  }),
);

adminRouter.get(
  "/site-settings/footer",
  asyncHandler(async (_req, res) => {
    res.json({ footer: await getFooterSettings() });
  }),
);

adminRouter.patch(
  "/site-settings/footer",
  asyncHandler(async (req, res) => {
    res.json({ footer: await upsertFooterSettings(req.body, req.admin!.id, req.requestId) });
  }),
);

adminRouter.get(
  "/media",
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    res.json(await listMediaAssets(req.query as unknown as { page: number; limit: number; search?: string; status?: string }));
  }),
);

adminRouter.get(
  "/media/storage-statistics",
  asyncHandler(async (_req, res) => {
    res.json(await storageStatistics());
  }),
);

adminRouter.post(
  "/media/upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const file = assertFile(req.file);
    const body = mediaUploadBodySchema.parse(req.body);
    const assets = await storeBufferInGridFs({
      buffer: file.buffer,
      originalName: file.originalname,
      declaredMimeType: file.mimetype,
      bucketName: body.bucketName,
      category: body.category,
      isPublic: body.isPublic,
      altText: body.altText || undefined,
      caption: body.caption || undefined,
      associatedModel: body.associatedModel || undefined,
      associatedDocumentId: body.associatedDocumentId ? new Types.ObjectId(body.associatedDocumentId) : undefined,
      uploadedBy: req.admin!.id
    });
    const originalAsset = firstAsset(assets);
    await recordAuditLog({
      adminId: req.admin!.id,
      action: "file_upload",
      resourceType: "MediaAsset",
      resourceId: originalAsset._id,
      requestId: req.requestId
    });
    res.status(201).json({ assets: assets.map((asset) => toMediaDto(asset)) });
  }),
);

adminRouter.get(
  "/media/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const asset = await MediaAsset.findOne({ _id: id, isDeleted: false });
    if (!asset) {
      throw new AppError(404, "MEDIA_NOT_FOUND", "Media asset was not found");
    }
    const variants = await MediaAsset.find({ parentAsset: asset._id, isDeleted: false }).sort({ variant: 1 });
    res.json({ asset: toMediaDto(asset), variants: variants.map((variant) => toMediaDto(variant)) });
  }),
);

adminRouter.patch(
  "/media/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const body = z
      .object({
        altText: z.string().trim().max(240).optional(),
        caption: z.string().trim().max(500).optional(),
        category: z.string().trim().max(80).optional(),
        isPublic: z.boolean().optional()
      })
      .parse(req.body);
    const asset = await MediaAsset.findByIdAndUpdate(id, body, { new: true });
    if (!asset) {
      throw new AppError(404, "MEDIA_NOT_FOUND", "Media asset was not found");
    }
    await MediaAsset.updateMany({ parentAsset: asset._id }, { $set: { isPublic: asset.isPublic } });
    await recordAuditLog({
      adminId: req.admin!.id,
      action: "file_update",
      resourceType: "MediaAsset",
      resourceId: asset._id,
      requestId: req.requestId
    });
    res.json({ asset: toMediaDto(asset) });
  }),
);

adminRouter.post(
  "/media/:id/replace",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const oldAsset = await MediaAsset.findById(id);
    if (!oldAsset) {
      throw new AppError(404, "MEDIA_NOT_FOUND", "Media asset was not found");
    }
    const file = assertFile(req.file);
    const assets = await storeBufferInGridFs({
      buffer: file.buffer,
      originalName: file.originalname,
      declaredMimeType: file.mimetype,
      bucketName: oldAsset.bucketName,
      category: oldAsset.category,
      isPublic: oldAsset.isPublic,
      altText: oldAsset.altText,
      caption: oldAsset.caption,
      associatedModel: oldAsset.associatedModel,
      associatedDocumentId: oldAsset.associatedDocumentId,
      uploadedBy: req.admin!.id
    });
    const originalAsset = firstAsset(assets);
    await replaceMediaReferences(oldAsset.parentAsset ?? oldAsset._id, originalAsset._id);
    await deleteAssetAndVariants(oldAsset._id.toString(), req.admin!.id, req.requestId, true);
    res.status(201).json({ assets: assets.map((asset) => toMediaDto(asset)) });
  }),
);

adminRouter.delete(
  "/media/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    await deleteAssetAndVariants(id, req.admin!.id, req.requestId);
    res.status(204).end();
  }),
);

adminRouter.post(
  "/media/cleanup",
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, statistics: await storageStatistics() });
  }),
);

adminRouter.get(
  "/media/:id/file",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    await streamMedia(req, res, id, { publicOnly: false, disposition: "inline" });
  }),
);

adminRouter.post(
  "/resumes",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const file = assertFile(req.file);
    const status = publicationStatusSchema.default("draft").parse(req.body.status ?? "draft");
    const shouldActivate = multipartBoolean(req.body.isActive);
    const assets = await storeBufferInGridFs({
      buffer: file.buffer,
      originalName: file.originalname,
      declaredMimeType: file.mimetype,
      bucketName: "resumes",
      category: "resume",
      isPublic: status === "published",
      altText: "Ankita Singh resume document",
      uploadedBy: req.admin!.id
    });
    const originalAsset = firstAsset(assets);
    if (shouldActivate) {
      await Resume.updateMany({}, { $set: { isActive: false } });
    }
    const resume = await Resume.create({
      title: req.body.title || file.originalname,
      mediaAsset: originalAsset._id,
      isActive: shouldActivate,
      status,
      uploadedAt: new Date()
    });
    if (shouldActivate) {
      await MediaAsset.findByIdAndUpdate(originalAsset._id, { isPublic: true });
    }
    await recordAuditLog({
      adminId: req.admin!.id,
      action: "resume_upload",
      resourceType: "Resume",
      resourceId: resume._id,
      requestId: req.requestId
    });
    res.status(201).json({ resume: { id: resume._id.toString(), mediaAssetId: originalAsset._id.toString() } });
  }),
);

adminRouter.get(
  "/resumes",
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as { page: number; limit: number; status?: string; search?: string };
    const filter: Record<string, unknown> = {};
    if (query.status && query.status !== "all") {
      filter.status = query.status;
    }
    if (query.search) {
      filter.title = new RegExp(query.search, "i");
    }
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      Resume.find(filter).populate(["mediaAsset"]).sort({ uploadedAt: -1 }).skip(skip).limit(query.limit),
      Resume.countDocuments(filter)
    ]);
    res.json({
      items: items.map((item) => ({
        id: item._id.toString(),
        title: item.get("title"),
        isActive: item.get("isActive"),
        status: item.get("status"),
        uploadedAt: item.get("uploadedAt"),
        mediaAsset: toMediaDto(item.get("mediaAsset") as Record<string, unknown>)
      })),
      total,
      page: query.page,
      limit: query.limit
    });
  }),
);

adminRouter.get(
  "/resumes/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const resume = await Resume.findById(id).populate(["mediaAsset"]);
    if (!resume) {
      throw new AppError(404, "RESUME_NOT_FOUND", "Resume was not found");
    }
    res.json({ resume: { ...resume.toObject(), id: resume._id.toString() } });
  }),
);

adminRouter.patch(
  "/resumes/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const body = z
      .object({
        title: z.string().trim().min(2).max(180).optional(),
        status: publicationStatusSchema.optional()
      })
      .parse(req.body);
    const resume = await Resume.findByIdAndUpdate(id, body, { new: true });
    if (!resume) {
      throw new AppError(404, "RESUME_NOT_FOUND", "Resume was not found");
    }
    res.json({ resume: { id: resume._id.toString(), title: resume.get("title"), status: resume.get("status") } });
  }),
);

adminRouter.patch(
  "/resumes/:id/activate",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const resume = await Resume.findById(id);
    if (!resume) {
      throw new AppError(404, "RESUME_NOT_FOUND", "Resume was not found");
    }
    await Resume.updateMany({}, { $set: { isActive: false } });
    resume.set({ isActive: true, status: "published" });
    await resume.save();
    await MediaAsset.findByIdAndUpdate(resume.get("mediaAsset"), { isPublic: true });
    await recordAuditLog({
      adminId: req.admin!.id,
      action: "resume_activation",
      resourceType: "Resume",
      resourceId: resume._id,
      requestId: req.requestId
    });
    res.json({ resume: { id: resume._id.toString(), isActive: true } });
  }),
);

adminRouter.patch(
  "/resumes/:id/archive",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const resume = await Resume.findByIdAndUpdate(id, { status: "archived", isActive: false }, { new: true });
    if (!resume) {
      throw new AppError(404, "RESUME_NOT_FOUND", "Resume was not found");
    }
    res.json({ resume: { id: resume._id.toString(), status: "archived", isActive: false } });
  }),
);

adminRouter.delete(
  "/resumes/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const resume = await Resume.findByIdAndDelete(id);
    if (!resume) {
      throw new AppError(404, "RESUME_NOT_FOUND", "Resume was not found");
    }
    await deleteAssetAndVariants(String(resume.get("mediaAsset")), req.admin!.id, req.requestId, true);
    res.status(204).end();
  }),
);

adminRouter.get(
  "/contact-messages",
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    res.json(await listContactMessages(req.query as unknown as { page: number; limit: number; search?: string; status?: string }));
  }),
);

adminRouter.get(
  "/audit-logs",
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    res.json(await listAuditLogs(req.query as unknown as { page: number; limit: number; search?: string }));
  }),
);

adminRouter.post(
  "/contact-messages/export",
  asyncHandler(async (req, res) => {
    const body = z.object({ ids: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1) }).parse(req.body);
    const csv = await exportContactMessagesCsv(body.ids);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=\"contact-messages.csv\"");
    res.send(csv);
  }),
);

adminRouter.patch(
  "/contact-messages/:id/status",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const body = contactStatusSchema.parse(req.body);
    await updateContactStatus(id, body.status);
    res.status(204).end();
  }),
);

adminRouter.delete(
  "/contact-messages/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    await deleteContactMessage(id);
    res.status(204).end();
  }),
);

adminRouter.get(
  "/:resource",
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const resource = requireResource(req.params.resource);
    res.json(await listContent(resource, req.query as unknown as { page: number; limit: number; search?: string; status?: string }));
  }),
);

adminRouter.post(
  "/:resource",
  asyncHandler(async (req, res) => {
    const resource = requireResource(req.params.resource);
    res.status(201).json({ item: await createContent(resource, req.body, req.admin!.id, req.requestId) });
  }),
);

adminRouter.get(
  "/:resource/:id",
  asyncHandler(async (req, res) => {
    const resource = requireResource(req.params.resource);
    const id = requireObjectId(req.params.id);
    res.json({ item: await getContent(resource, id) });
  }),
);

adminRouter.patch(
  "/:resource/:id",
  asyncHandler(async (req, res) => {
    const resource = requireResource(req.params.resource);
    const id = requireObjectId(req.params.id);
    res.json({ item: await updateContent(resource, id, req.body, req.admin!.id, req.requestId) });
  }),
);

adminRouter.delete(
  "/:resource/:id",
  asyncHandler(async (req, res) => {
    const resource = requireResource(req.params.resource);
    const id = requireObjectId(req.params.id);
    await deleteContent(resource, id, req.admin!.id, req.requestId);
    res.status(204).end();
  }),
);
