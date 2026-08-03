import { Router } from 'express';

import {
  aboutSchema,
  certificateSchema,
  educationSchema,
  heroSchema,
  interestSchema,
  languageSchema,
  mediaMetadataSchema,
  navigationItemSchema,
  paginationSchema,
  personalProfileSchema,
  personalSkillSchema,
  privatePersonalDetailsSchema,
  projectSchema,
  publicationStatusSchema,
  reorderSchema,
  resumeSchema,
  seoSettingsSchema,
  siteSettingsSchema,
  skillCategorySchema,
  skillSchema,
  socialLinkSchema,
  trainingSchema,
  experienceSchema,
} from '@ankita-portfolio/validation';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { createAuditLog } from '../services/audit.service.js';
import {
  cleanupOrphanedMedia,
  deleteMediaAsset,
  getMediaAssetById,
  getMediaStorageStatistics,
  listMediaAssets,
  replaceMediaAsset,
  streamMediaAsset,
  updateMediaMetadata,
  uploadMedia,
} from '../services/media.service.js';
import {
  collectionRegistry,
  createCollectionItem,
  deleteCollectionItem,
  getCollectionItem,
  getDashboardOverview,
  getSingleton,
  listCollectionItems,
  reorderCollection,
  singletonRegistry,
  updateCollectionItem,
  updateCollectionStatus,
  updateSingleton,
} from '../services/portfolio.service.js';
import { getContactMessageById, listContactMessages, updateContactMessageStatus, deleteContactMessage, exportContactMessagesAsCsv } from '../services/contact.service.js';
import { PrivatePersonalDetailsModel, ResumeModel, PersonalProfileModel, AuditLogModel } from '../models/index.js';
import { sendSuccess } from '../utils/http.js';
import { AppError } from '../errors/app-error.js';

const adminRouter = Router();

const collectionSchemaRegistry = {
  experience: experienceSchema,
  education: educationSchema,
  training: trainingSchema,
  skillCategories: skillCategorySchema,
  skills: skillSchema,
  personalSkills: personalSkillSchema,
  projects: projectSchema,
  languages: languageSchema,
  interests: interestSchema,
  certificates: certificateSchema,
  socialLinks: socialLinkSchema,
  navigation: navigationItemSchema,
} as const;

const singletonSchemaRegistry = {
  profile: personalProfileSchema,
  hero: heroSchema,
  about: aboutSchema,
  siteSettings: siteSettingsSchema,
  seo: seoSettingsSchema,
} as const;

function parsePaginationQuery(query: Record<string, unknown>) {
  return paginationSchema.parse(query);
}

adminRouter.use(requireAuth);

adminRouter.get(
  '/dashboard/overview',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getDashboardOverview());
  }),
);

for (const key of Object.keys(singletonRegistry) as Array<keyof typeof singletonRegistry>) {
  adminRouter.get(
    `/${key}`,
    asyncHandler(async (_request, response) => {
      sendSuccess(response, await getSingleton(key));
    }),
  );

  adminRouter.patch(
    `/${key}`,
    asyncHandler(async (request, response) => {
      const schema = singletonSchemaRegistry[key as keyof typeof singletonSchemaRegistry];
      const payload = schema.partial().parse(request.body);
      const updated = await updateSingleton(key, payload, request.auth!.adminId, request.requestId);
      sendSuccess(response, updated);
    }),
  );
}

adminRouter.get(
  '/private-details',
  asyncHandler(async (_request, response) => {
    const details = await PrivatePersonalDetailsModel.findOne({}).lean();
    sendSuccess(
      response,
      details
        ? {
            ...details,
            id: String(details._id),
          }
        : null,
    );
  }),
);

adminRouter.patch(
  '/private-details',
  asyncHandler(async (request, response) => {
    const payload = privatePersonalDetailsSchema.partial().parse(request.body);
    const updated = await PrivatePersonalDetailsModel.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    await createAuditLog({
      adminId: request.auth!.adminId,
      action: 'update_private_details',
      resourceType: 'private-details',
      resourceId: updated?._id.toString(),
      requestId: request.requestId,
    });

    sendSuccess(response, updated?.toJSON() ?? null);
  }),
);

for (const key of Object.keys(collectionRegistry)) {
  const schema = collectionSchemaRegistry[key as keyof typeof collectionSchemaRegistry];
  if (!schema) {
    continue;
  }

  adminRouter.get(
    `/${key}`,
    asyncHandler(async (request, response) => {
      const query = parsePaginationQuery(request.query as Record<string, unknown>);
      const featured =
        typeof request.query.featured === 'string'
          ? request.query.featured === 'true'
          : undefined;

      sendSuccess(
        response,
        await listCollectionItems(key, {
          page: query.page,
          limit: query.limit,
          search: query.search,
          status: query.status,
          featured,
        }),
      );
    }),
  );

  adminRouter.post(
    `/${key}`,
    asyncHandler(async (request, response) => {
      const payload = schema.parse(request.body);
      const created = await createCollectionItem(key, payload, request.auth!.adminId, request.requestId);
      sendSuccess(response, created, undefined, 201);
    }),
  );

  adminRouter.patch(
    `/${key}/reorder`,
    asyncHandler(async (request, response) => {
      const { ids } = reorderSchema.parse(request.body);
      await reorderCollection(key, ids, request.auth!.adminId, request.requestId);
      sendSuccess(response, { reordered: true });
    }),
  );

  adminRouter.get(
    `/${key}/:id`,
    asyncHandler(async (request, response) => {
      sendSuccess(response, await getCollectionItem(key, String(request.params.id)));
    }),
  );

  adminRouter.patch(
    `/${key}/:id/status`,
    asyncHandler(async (request, response) => {
      const publicationStatus = publicationStatusSchema.parse(request.body.publicationStatus);
      sendSuccess(
        response,
        await updateCollectionStatus(
          key,
          String(request.params.id),
          publicationStatus,
          request.auth!.adminId,
          request.requestId,
        ),
      );
    }),
  );

  adminRouter.patch(
    `/${key}/:id`,
    asyncHandler(async (request, response) => {
      const payload = schema.partial().parse(request.body);
      sendSuccess(
        response,
        await updateCollectionItem(
          key,
          String(request.params.id),
          payload,
          request.auth!.adminId,
          request.requestId,
        ),
      );
    }),
  );

  adminRouter.delete(
    `/${key}/:id`,
    asyncHandler(async (request, response) => {
      await deleteCollectionItem(
        key,
        String(request.params.id),
        request.auth!.adminId,
        request.requestId,
      );
      sendSuccess(response, { deleted: true });
    }),
  );
}

adminRouter.post(
  '/media/upload',
  upload.single('file'),
  asyncHandler(async (request, response) => {
    if (!request.file) {
      throw new AppError(400, 'A file upload is required', 'FILE_REQUIRED');
    }

    const metadata = mediaMetadataSchema.parse(request.body);
    const category = metadata.category;
    if (!category) {
      throw new AppError(400, 'Media category is required', 'MEDIA_CATEGORY_REQUIRED');
    }

    const uploaded = await uploadMedia({
      file: request.file,
      category,
      isPublic: metadata.isPublic,
      altText: metadata.altText,
      caption: metadata.caption,
      associatedModel: metadata.associatedModel,
      associatedDocumentId: metadata.associatedDocumentId,
      adminId: request.auth!.adminId,
      requestId: request.requestId,
    });

    sendSuccess(response, uploaded, undefined, 201);
  }),
);

adminRouter.get(
  '/media/storage-statistics',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getMediaStorageStatistics());
  }),
);

adminRouter.post(
  '/media/cleanup',
  asyncHandler(async (request, response) => {
    sendSuccess(response, await cleanupOrphanedMedia(request.auth!.adminId, request.requestId));
  }),
);

adminRouter.get(
  '/media',
  asyncHandler(async (request, response) => {
    const query = parsePaginationQuery(request.query as Record<string, unknown>);
    sendSuccess(
      response,
      await listMediaAssets({
        page: query.page,
        limit: query.limit,
        search: query.search,
        category: typeof request.query.category === 'string' ? request.query.category : undefined,
        isPublic:
          typeof request.query.isPublic === 'string'
            ? request.query.isPublic === 'true'
            : undefined,
      }),
    );
  }),
);

adminRouter.get(
  '/media/:id',
  asyncHandler(async (request, response) => {
    sendSuccess(response, (await getMediaAssetById(String(request.params.id))).toJSON());
  }),
);

adminRouter.get(
  '/media/:id/file',
  asyncHandler(async (request, response) => {
    await streamMediaAsset({
      request,
      response,
      assetId: String(request.params.id),
      variant: typeof request.query.variant === 'string' ? (request.query.variant as never) : undefined,
      download: request.query.download === '1',
    });
  }),
);

adminRouter.patch(
  '/media/:id',
  asyncHandler(async (request, response) => {
    const metadata = mediaMetadataSchema.partial().parse(request.body);
    sendSuccess(
      response,
      await updateMediaMetadata(
        String(request.params.id),
        metadata,
        request.auth!.adminId,
        request.requestId,
      ),
    );
  }),
);

adminRouter.post(
  '/media/:id/replace',
  upload.single('file'),
  asyncHandler(async (request, response) => {
    if (!request.file) {
      throw new AppError(400, 'A file upload is required', 'FILE_REQUIRED');
    }
    sendSuccess(
      response,
      await replaceMediaAsset(
        String(request.params.id),
        request.file,
        request.auth!.adminId,
        request.requestId,
      ),
    );
  }),
);

adminRouter.delete(
  '/media/:id',
  asyncHandler(async (request, response) => {
    await deleteMediaAsset(String(request.params.id), request.auth!.adminId, request.requestId);
    sendSuccess(response, { deleted: true });
  }),
);

adminRouter.post(
  '/resumes',
  upload.single('file'),
  asyncHandler(async (request, response) => {
    if (!request.file) {
      throw new AppError(400, 'A resume file is required', 'FILE_REQUIRED');
    }

    const uploaded = await uploadMedia({
      file: request.file,
      category: 'resume',
      isPublic: true,
      adminId: request.auth!.adminId,
      requestId: request.requestId,
    });

    const payload = resumeSchema.parse({
      ...request.body,
      mediaAssetId: String(uploaded.asset.id),
    });

    if (payload.isActive) {
      await ResumeModel.updateMany({}, { $set: { isActive: false } });
    }

    const created = await ResumeModel.create(payload);
    if (payload.isActive) {
      await PersonalProfileModel.findOneAndUpdate({}, { $set: { activeResumeId: created._id } });
    }

    await updateMediaMetadata(
      String(uploaded.asset.id),
      {
        associatedModel: 'Resume',
        associatedDocumentId: created._id.toString(),
      },
      request.auth!.adminId,
      request.requestId,
    );

    sendSuccess(response, created.toJSON(), undefined, 201);
  }),
);

adminRouter.get(
  '/resumes',
  asyncHandler(async (_request, response) => {
    const resumes = await ResumeModel.find({}).sort({ createdAt: -1 }).lean();
    sendSuccess(
      response,
      resumes.map((resume) => ({
        ...resume,
        id: String(resume._id),
      })),
    );
  }),
);

adminRouter.get(
  '/resumes/:id',
  asyncHandler(async (request, response) => {
    const resume = await ResumeModel.findById(String(request.params.id)).lean();
    if (!resume) {
      throw new AppError(404, 'Resume not found', 'RESUME_NOT_FOUND');
    }
    sendSuccess(response, { ...resume, id: String(resume._id) });
  }),
);

adminRouter.patch(
  '/resumes/:id',
  asyncHandler(async (request, response) => {
    const payload = resumeSchema.partial().parse(request.body);
    const updated = await ResumeModel.findByIdAndUpdate(String(request.params.id), payload, {
      new: true,
    });
    if (!updated) {
      throw new AppError(404, 'Resume not found', 'RESUME_NOT_FOUND');
    }
    sendSuccess(response, updated.toJSON());
  }),
);

adminRouter.patch(
  '/resumes/:id/activate',
  asyncHandler(async (request, response) => {
    const resume = await ResumeModel.findById(String(request.params.id));
    if (!resume) {
      throw new AppError(404, 'Resume not found', 'RESUME_NOT_FOUND');
    }
    await ResumeModel.updateMany({}, { $set: { isActive: false } });
    resume.isActive = true;
    resume.archivedAt = null;
    await resume.save();
    await PersonalProfileModel.findOneAndUpdate({}, { $set: { activeResumeId: resume._id } });

    await createAuditLog({
      adminId: request.auth!.adminId,
      action: 'activate_resume',
      resourceType: 'resume',
      resourceId: resume._id.toString(),
      requestId: request.requestId,
    });

    sendSuccess(response, resume.toJSON());
  }),
);

adminRouter.patch(
  '/resumes/:id/archive',
  asyncHandler(async (request, response) => {
    const resume = await ResumeModel.findById(String(request.params.id));
    if (!resume) {
      throw new AppError(404, 'Resume not found', 'RESUME_NOT_FOUND');
    }

    resume.archivedAt = new Date();
    resume.isActive = false;
    resume.publicationStatus = 'archived';
    await resume.save();

    await createAuditLog({
      adminId: request.auth!.adminId,
      action: 'archive_resume',
      resourceType: 'resume',
      resourceId: resume._id.toString(),
      requestId: request.requestId,
    });

    sendSuccess(response, resume.toJSON());
  }),
);

adminRouter.delete(
  '/resumes/:id',
  asyncHandler(async (request, response) => {
    const resume = await ResumeModel.findById(String(request.params.id));
    if (!resume) {
      throw new AppError(404, 'Resume not found', 'RESUME_NOT_FOUND');
    }
    if (resume.isActive) {
      throw new AppError(409, 'Active resume cannot be deleted', 'ACTIVE_RESUME_DELETE_BLOCKED');
    }

    await ResumeModel.deleteOne({ _id: String(request.params.id) });
    sendSuccess(response, { deleted: true });
  }),
);

adminRouter.get(
  '/contact-messages/export',
  asyncHandler(async (request, response) => {
    const csv = await exportContactMessagesAsCsv({
      status: typeof request.query.status === 'string' ? request.query.status : undefined,
    });
    response.setHeader('Content-Type', 'text/csv');
    response.setHeader('Content-Disposition', 'attachment; filename="contact-messages.csv"');
    response.status(200).send(csv);
  }),
);

adminRouter.get(
  '/contact-messages',
  asyncHandler(async (request, response) => {
    const query = parsePaginationQuery(request.query as Record<string, unknown>);
    sendSuccess(
      response,
      await listContactMessages({
        page: query.page,
        limit: query.limit,
        search: query.search,
        status: typeof request.query.status === 'string' ? request.query.status : undefined,
      }),
    );
  }),
);

adminRouter.get(
  '/contact-messages/:id',
  asyncHandler(async (request, response) => {
    sendSuccess(response, await getContactMessageById(String(request.params.id)));
  }),
);

adminRouter.patch(
  '/contact-messages/:id/status',
  asyncHandler(async (request, response) => {
    const status = request.body.status as 'unread' | 'read' | 'replied' | 'archived';
    sendSuccess(
        response,
        await updateContactMessageStatus(
          String(request.params.id),
          status,
          request.auth!.adminId,
          request.requestId,
      ),
    );
  }),
);

adminRouter.delete(
  '/contact-messages/:id',
  asyncHandler(async (request, response) => {
    await deleteContactMessage(
      String(request.params.id),
      request.auth!.adminId,
      request.requestId,
    );
    sendSuccess(response, { deleted: true });
  }),
);

adminRouter.get(
  '/audit-logs',
  asyncHandler(async (request, response) => {
    const query = parsePaginationQuery(request.query as Record<string, unknown>);
    const [items, totalItems] = await Promise.all([
      AuditLogModel.find({})
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      AuditLogModel.countDocuments(),
    ]);

    sendSuccess(response, {
      items: items.map((item) => ({ ...item, id: String(item._id) })),
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
      },
    });
  }),
);

export { adminRouter };
