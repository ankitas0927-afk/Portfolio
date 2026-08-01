import type { Model } from "mongoose";
import { Types } from "mongoose";
import type { AnyZodObject } from "zod";
import {
  educationSchema,
  experienceSchema,
  interestSchema,
  languageSchema,
  paginationSchema,
  personalSkillSchema,
  profileSchema,
  projectSchema,
  skillCategorySchema,
  skillSchema,
  trainingSchema
} from "@ankita-portfolio/validation";
import { AppError } from "../errors/appError";
import {
  Education,
  Experience,
  Interest,
  Language,
  PersonalSkill,
  Profile,
  Project,
  Skill,
  SkillCategory,
  Training,
  type ContentDocument
} from "../models/content";
import { sanitizeRecord } from "../utils/sanitize";
import { recordAuditLog } from "./auditLog.service";

export type ContentResource =
  | "profile"
  | "experiences"
  | "education"
  | "training"
  | "skill-categories"
  | "skills"
  | "personal-skills"
  | "languages"
  | "interests"
  | "projects";

type ContentConfig = {
  model: Model<ContentDocument>;
  schema: AnyZodObject;
  searchFields: string[];
  populate?: string[];
  singleton?: boolean;
};

export const contentConfigs: Record<ContentResource, ContentConfig> = {
  profile: {
    model: Profile,
    schema: profileSchema,
    searchFields: ["name", "heading"],
    populate: ["profileImage", "heroImage", "aboutImage", "logo", "favicon", "openGraphImage"],
    singleton: true
  },
  experiences: {
    model: Experience,
    schema: experienceSchema,
    searchFields: ["jobTitle", "organisation", "location"],
    populate: ["organisationLogo"]
  },
  education: {
    model: Education,
    schema: educationSchema,
    searchFields: ["institution", "qualification", "location"],
    populate: ["institutionLogo", "supportingDocument"]
  },
  training: {
    model: Training,
    schema: trainingSchema,
    searchFields: ["organisation", "trainingTitle", "department", "location"],
    populate: ["certificateImage", "certificatePdf", "organisationLogo"]
  },
  "skill-categories": {
    model: SkillCategory,
    schema: skillCategorySchema,
    searchFields: ["name", "description"]
  },
  skills: {
    model: Skill,
    schema: skillSchema,
    searchFields: ["name", "description"],
    populate: ["category", "logoImage"]
  },
  "personal-skills": {
    model: PersonalSkill,
    schema: personalSkillSchema,
    searchFields: ["title", "description"]
  },
  languages: {
    model: Language,
    schema: languageSchema,
    searchFields: ["name"]
  },
  interests: {
    model: Interest,
    schema: interestSchema,
    searchFields: ["title", "description"],
    populate: ["image"]
  },
  projects: {
    model: Project,
    schema: projectSchema,
    searchFields: ["title", "shortDescription", "category"],
    populate: ["thumbnail", "galleryImages", "supportingDocuments", "openGraphImage"]
  }
};

export const contentQuerySchema = paginationSchema;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Types.ObjectId) {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item));
  }
  if (isObject(value)) {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (key === "__v") {
        continue;
      }
      if (key === "_id") {
        output.id = serializeValue(nested);
        continue;
      }
      output[key] = serializeValue(nested);
    }
    return output;
  }
  return value;
}

export function serializeAdminDocument(document: ContentDocument | Record<string, unknown>): Record<string, unknown> {
  const source = typeof (document as ContentDocument).toObject === "function" ? (document as ContentDocument).toObject() : document;
  return serializeValue(source) as Record<string, unknown>;
}

function mediaId(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }
  if (value instanceof Types.ObjectId) {
    return value.toString();
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  if (isObject(value) && "_id" in value) {
    return mediaId((value as { _id?: unknown })._id);
  }
  return undefined;
}

function hasOwnProperty(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function buildFilter(config: ContentConfig, query: { search?: string; status?: string }): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (query.search) {
    filter.$or = config.searchFields.map((field) => ({ [field]: new RegExp(query.search ?? "", "i") }));
  }
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }
  return filter;
}

export function getContentConfig(resource: string): ContentConfig {
  const config = contentConfigs[resource as ContentResource];
  if (!config) {
    throw new AppError(404, "RESOURCE_NOT_FOUND", "Content resource was not found");
  }
  return config;
}

export async function listContent(
  resource: ContentResource,
  query: { page: number; limit: number; search?: string; status?: string },
): Promise<{ items: Record<string, unknown>[]; total: number; page: number; limit: number }> {
  const config = getContentConfig(resource);
  const filter = buildFilter(config, query);
  const skip = (query.page - 1) * query.limit;
  const baseQuery = config.model.find(filter).sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(query.limit);
  if (config.populate) {
    baseQuery.populate(config.populate);
  }
  const [documents, total] = await Promise.all([baseQuery, config.model.countDocuments(filter)]);
  return {
    items: documents.map((document) => serializeAdminDocument(document)),
    total,
    page: query.page,
    limit: query.limit
  };
}

export async function getContent(resource: ContentResource, id: string): Promise<Record<string, unknown>> {
  const config = getContentConfig(resource);
  const query = config.model.findById(id);
  if (config.populate) {
    query.populate(config.populate);
  }
  const document = await query;
  if (!document) {
    throw new AppError(404, "CONTENT_NOT_FOUND", "Content item was not found");
  }
  return serializeAdminDocument(document);
}

export async function getSingletonProfile(): Promise<Record<string, unknown> | null> {
  const config = contentConfigs.profile;
  const query = config.model.findOne().sort({ createdAt: 1 });
  query.populate(config.populate ?? []);
  const document = await query;
  return document ? serializeAdminDocument(document) : null;
}

export async function upsertSingletonProfile(
  body: unknown,
  adminId: Types.ObjectId,
  requestId?: string,
): Promise<Record<string, unknown>> {
  const config = contentConfigs.profile;
  const parsed = sanitizeRecord(config.schema.parse(body) as Record<string, unknown>);
  const existing = await Profile.findOne().sort({ createdAt: 1 });
  const profileImageId = mediaId(parsed.profileImage) ?? mediaId(existing?.profileImage);
  const nextPayload: Record<string, unknown> = { ...parsed };

  if (profileImageId) {
    const existingProfileImageId = mediaId(existing?.profileImage);
    const derivedFields = ["heroImage", "aboutImage", "logo", "favicon", "openGraphImage"] as const;
    for (const field of derivedFields) {
      if (hasOwnProperty(parsed, field)) {
        continue;
      }
      const currentFieldId = mediaId(existing?.get(field));
      if (!currentFieldId || currentFieldId === existingProfileImageId) {
        nextPayload[field] = parsed.profileImage ?? existing?.profileImage;
      }
    }
  }

  const document = existing
    ? await Profile.findByIdAndUpdate(existing._id, nextPayload, { new: true, runValidators: true })
    : await Profile.create(nextPayload);
  if (!document) {
    throw new AppError(500, "PROFILE_SAVE_FAILED", "Profile could not be saved");
  }
  await recordAuditLog({
    adminId,
    action: existing ? "profile_update" : "profile_create",
    resourceType: "Profile",
    resourceId: document._id,
    requestId
  });
  return serializeAdminDocument(document);
}

export async function createContent(
  resource: ContentResource,
  body: unknown,
  adminId: Types.ObjectId,
  requestId?: string,
): Promise<Record<string, unknown>> {
  const config = getContentConfig(resource);
  const parsed = sanitizeRecord(config.schema.parse(body) as Record<string, unknown>);
  const document = await config.model.create(parsed);
  await recordAuditLog({
    adminId,
    action: "content_creation",
    resourceType: resource,
    resourceId: document._id,
    requestId
  });
  return serializeAdminDocument(document);
}

export async function updateContent(
  resource: ContentResource,
  id: string,
  body: unknown,
  adminId: Types.ObjectId,
  requestId?: string,
): Promise<Record<string, unknown>> {
  const config = getContentConfig(resource);
  const parsed = sanitizeRecord(config.schema.partial().parse(body) as Record<string, unknown>);
  const document = await config.model.findByIdAndUpdate(id, parsed, { new: true, runValidators: true });
  if (!document) {
    throw new AppError(404, "CONTENT_NOT_FOUND", "Content item was not found");
  }
  await recordAuditLog({
    adminId,
    action: "content_update",
    resourceType: resource,
    resourceId: document._id,
    requestId
  });
  return serializeAdminDocument(document);
}

export async function deleteContent(
  resource: ContentResource,
  id: string,
  adminId: Types.ObjectId,
  requestId?: string,
): Promise<void> {
  const config = getContentConfig(resource);
  const document = await config.model.findByIdAndDelete(id);
  if (!document) {
    throw new AppError(404, "CONTENT_NOT_FOUND", "Content item was not found");
  }
  await recordAuditLog({
    adminId,
    action: "content_deletion",
    resourceType: resource,
    resourceId: document._id,
    requestId
  });
}
