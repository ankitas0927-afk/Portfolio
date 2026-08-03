import type { Model } from 'mongoose';

import {
  AboutModel,
  AuditLogModel,
  CertificateModel,
  EducationModel,
  ExperienceModel,
  HeroModel,
  InterestModel,
  LanguageModel,
  MediaAssetModel,
  NavigationItemModel,
  PersonalProfileModel,
  PersonalSkillModel,
  ProfessionalTrainingModel,
  ProjectModel,
  ResumeModel,
  SeoSettingsModel,
  SiteSettingsModel,
  SkillCategoryModel,
  SkillModel,
  SocialLinkModel,
  ContactMessageModel,
} from '../models/index.js';
import { AppError } from '../errors/app-error.js';
import { createAuditLog } from './audit.service.js';

type CollectionConfig = {
  model: Model<Record<string, unknown>>;
  searchFields: string[];
};

export const collectionRegistry: Record<string, CollectionConfig> = {
  experience: {
    model: ExperienceModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['jobTitle', 'organisation', 'location'],
  },
  education: {
    model: EducationModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['institution', 'qualification', 'fieldOfStudy'],
  },
  training: {
    model: ProfessionalTrainingModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['organisation', 'trainingTitle', 'department'],
  },
  skillCategories: {
    model: SkillCategoryModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['name', 'description'],
  },
  skills: {
    model: SkillModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['name', 'description'],
  },
  personalSkills: {
    model: PersonalSkillModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['title', 'description'],
  },
  projects: {
    model: ProjectModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['title', 'slug', 'shortDescription', 'category'],
  },
  languages: {
    model: LanguageModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['name'],
  },
  interests: {
    model: InterestModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['title', 'description'],
  },
  certificates: {
    model: CertificateModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['title', 'issuingOrganisation'],
  },
  socialLinks: {
    model: SocialLinkModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['label', 'url'],
  },
  navigation: {
    model: NavigationItemModel as unknown as Model<Record<string, unknown>>,
    searchFields: ['label', 'href'],
  },
};

export const singletonRegistry: Record<string, Model<Record<string, unknown>>> = {
  profile: PersonalProfileModel as unknown as Model<Record<string, unknown>>,
  hero: HeroModel as unknown as Model<Record<string, unknown>>,
  about: AboutModel as unknown as Model<Record<string, unknown>>,
  siteSettings: SiteSettingsModel as unknown as Model<Record<string, unknown>>,
  seo: SeoSettingsModel as unknown as Model<Record<string, unknown>>,
};

function getCollectionOrThrow(key: string) {
  const collection = collectionRegistry[key];
  if (!collection) {
    throw new AppError(404, `Unknown collection "${key}"`, 'COLLECTION_NOT_FOUND');
  }
  return collection;
}

export async function listCollectionItems(
  key: string,
  query: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    featured?: boolean;
  },
) {
  const collection = getCollectionOrThrow(key);
  const filter: Record<string, unknown> = {};

  if (query.status) {
    filter.publicationStatus = query.status;
  }
  if (typeof query.featured === 'boolean') {
    filter.featured = query.featured;
  }
  if (query.search) {
    filter.$or = collection.searchFields.map((field) => ({
      [field]: { $regex: query.search, $options: 'i' },
    }));
  }

  const [totalItems, items] = await Promise.all([
    collection.model.countDocuments(filter),
    collection.model
      .find(filter)
      .sort({ displayOrder: 1, updatedAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    items: items.map((item) => ({ ...item, id: String(item._id) })),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / query.limit),
    },
  };
}

export async function getCollectionItem(key: string, id: string) {
  const collection = getCollectionOrThrow(key);
  const item = await collection.model.findById(id).lean();
  if (!item) {
    throw new AppError(404, 'Resource not found', 'RESOURCE_NOT_FOUND');
  }
  return { ...item, id: String(item._id) };
}

export async function createCollectionItem(
  key: string,
  payload: Record<string, unknown>,
  adminId: string,
  requestId: string,
) {
  const collection = getCollectionOrThrow(key);
  const created = await collection.model.create(payload);
  await createAuditLog({
    adminId,
    action: `create_${key}`,
    resourceType: key,
    resourceId: String((created as { _id: unknown })._id),
    requestId,
  });
  return created.toJSON();
}

export async function updateCollectionItem(
  key: string,
  id: string,
  payload: Record<string, unknown>,
  adminId: string,
  requestId: string,
) {
  const collection = getCollectionOrThrow(key);
  const updated = await collection.model.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw new AppError(404, 'Resource not found', 'RESOURCE_NOT_FOUND');
  }

  await createAuditLog({
    adminId,
    action: `update_${key}`,
    resourceType: key,
    resourceId: id,
    requestId,
  });

  return updated.toJSON();
}

export async function deleteCollectionItem(
  key: string,
  id: string,
  adminId: string,
  requestId: string,
) {
  const collection = getCollectionOrThrow(key);
  const deleted = await collection.model.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(404, 'Resource not found', 'RESOURCE_NOT_FOUND');
  }

  await createAuditLog({
    adminId,
    action: `delete_${key}`,
    resourceType: key,
    resourceId: id,
    requestId,
  });
}

export async function updateCollectionStatus(
  key: string,
  id: string,
  publicationStatus: 'draft' | 'published' | 'archived',
  adminId: string,
  requestId: string,
) {
  return updateCollectionItem(key, id, { publicationStatus }, adminId, requestId);
}

export async function reorderCollection(
  key: string,
  ids: string[],
  adminId: string,
  requestId: string,
) {
  const collection = getCollectionOrThrow(key);
  await Promise.all(
    ids.map((id, index) =>
      collection.model.updateOne({ _id: id }, { $set: { displayOrder: index } }),
    ),
  );

  await createAuditLog({
    adminId,
    action: `reorder_${key}`,
    resourceType: key,
    requestId,
  });
}

export async function getSingleton(key: keyof typeof singletonRegistry) {
  const model = singletonRegistry[key];
  const document = await model.findOne({}).lean();
  return document ? { ...document, id: String(document._id) } : null;
}

export async function updateSingleton(
  key: keyof typeof singletonRegistry,
  payload: Record<string, unknown>,
  adminId: string,
  requestId: string,
) {
  const model = singletonRegistry[key];
  const updated = await model.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });

  await createAuditLog({
    adminId,
    action: `update_${key}`,
    resourceType: key,
    resourceId: String((updated as { _id: unknown })._id),
    requestId,
  });

  return updated.toJSON();
}

export async function getDashboardOverview() {
  const [
    publishedProjects,
    draftProjects,
    experienceRecords,
    educationRecords,
    trainingRecords,
    skills,
    resumeVersions,
    media,
    contactMessages,
    unreadContactMessages,
    recentActivity,
  ] = await Promise.all([
    ProjectModel.countDocuments({ publicationStatus: 'published' }),
    ProjectModel.countDocuments({ publicationStatus: 'draft' }),
    ExperienceModel.countDocuments(),
    EducationModel.countDocuments(),
    ProfessionalTrainingModel.countDocuments(),
    SkillModel.countDocuments(),
    ResumeModel.countDocuments(),
    MediaAssetModel.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: null, totalFiles: { $sum: 1 }, totalBytes: { $sum: '$size' } } },
    ]),
    ContactMessageModel.countDocuments(),
    ContactMessageModel.countDocuments({ status: 'unread' }),
    AuditLogModel.find({}).sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  return {
    publishedProjects,
    draftProjects,
    experienceRecords,
    educationRecords,
    trainingRecords,
    skills,
    resumeVersions,
    gridFsFileCount: media[0]?.totalFiles ?? 0,
    mediaStorageUsage: media[0]?.totalBytes ?? 0,
    contactMessages,
    unreadContactMessages,
    recentlyUpdatedContent: {
      profile: await PersonalProfileModel.findOne({}, { updatedAt: 1 }).lean(),
      hero: await HeroModel.findOne({}, { updatedAt: 1 }).lean(),
      about: await AboutModel.findOne({}, { updatedAt: 1 }).lean(),
    },
    recentAdministratorActivity: recentActivity.map((entry) => ({
      ...entry,
      id: String(entry._id),
    })),
  };
}
