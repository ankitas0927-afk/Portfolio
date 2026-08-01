import { Types } from "mongoose";
import type { FooterSettingsDto } from "@ankita-portfolio/shared-types";
import { footerSettingsSchema } from "@ankita-portfolio/validation";
import { AppError } from "../errors/appError";
import { SiteSetting } from "../models/content";
import { recordAuditLog } from "./auditLog.service";
import { sanitizeRecord } from "../utils/sanitize";

const FOOTER_SETTINGS_KEY = "footer";

type LeanRecord = Record<string, unknown> & {
  _id: Types.ObjectId | string;
  key?: string;
  value?: unknown;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function toFooterSettingsDto(value: unknown, updatedAt?: unknown): FooterSettingsDto {
  const parsed = footerSettingsSchema.parse(value ?? {});
  return {
    contactEmail: asOptionalString(parsed.contactEmail),
    contactPhone: asOptionalString(parsed.contactPhone),
    contactLocation: asOptionalString(parsed.contactLocation),
    socialLinks: {
      website: asOptionalString(parsed.socialLinks.website),
      github: asOptionalString(parsed.socialLinks.github),
      linkedin: asOptionalString(parsed.socialLinks.linkedin),
      instagram: asOptionalString(parsed.socialLinks.instagram),
      facebook: asOptionalString(parsed.socialLinks.facebook),
      x: asOptionalString(parsed.socialLinks.x),
      youtube: asOptionalString(parsed.socialLinks.youtube)
    },
    updatedAt:
      updatedAt instanceof Date
        ? updatedAt.toISOString()
        : typeof updatedAt === "string"
          ? updatedAt
          : undefined
  };
}

export async function getFooterSettings(): Promise<FooterSettingsDto | null> {
  const document = await SiteSetting.findOne({ key: FOOTER_SETTINGS_KEY, isPublic: true }).lean<LeanRecord>();
  return document ? toFooterSettingsDto(document.value, document.updatedAt) : null;
}

export async function upsertFooterSettings(
  body: unknown,
  adminId: Types.ObjectId,
  requestId?: string,
): Promise<FooterSettingsDto> {
  const parsed = sanitizeRecord(footerSettingsSchema.parse(body) as Record<string, unknown>);
  const document = await SiteSetting.findOneAndUpdate(
    { key: FOOTER_SETTINGS_KEY },
    {
      key: FOOTER_SETTINGS_KEY,
      value: parsed,
      isPublic: true
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true
    },
  ).lean<LeanRecord>();

  if (!document) {
    throw new AppError(500, "FOOTER_SETTINGS_SAVE_FAILED", "Footer settings could not be saved");
  }

  await recordAuditLog({
    adminId,
    action: "footer_settings_update",
    resourceType: "SiteSetting",
    resourceId: new Types.ObjectId(String(document._id)),
    requestId
  });

  return toFooterSettingsDto(document.value, document.updatedAt);
}
