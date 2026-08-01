import { z } from "zod";

const booleanString = z
  .string()
  .optional()
  .default("false")
  .transform((value) => value === "true");

const sameSiteSchema = z.enum(["lax", "strict", "none"]).default("lax");

export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  API_PUBLIC_URL: z.string().url().default("http://localhost:5000"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  COOKIE_SECURE: booleanString,
  COOKIE_SAME_SITE: sameSiteSchema,
  ADMIN_NAME: z.string().min(2),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_INITIAL_PASSWORD: z.string().min(8),
  RESUME_PDF_PATH: z.string().optional(),
  PROFILE_IMAGE_PATH: z.string().optional(),
  OWNER_PUBLIC_EMAIL: z.string().email().optional().or(z.literal("")),
  OWNER_PRIVATE_EMAIL: z.string().email().optional().or(z.literal("")),
  OWNER_PUBLIC_PHONE: z.string().optional(),
  OWNER_PRIVATE_PHONE: z.string().optional(),
  OWNER_CITY: z.string().optional(),
  OWNER_STATE: z.string().optional(),
  OWNER_COUNTRY: z.string().optional(),
  OWNER_PRIVATE_ADDRESS: z.string().optional(),
  OWNER_DATE_OF_BIRTH: z.string().optional(),
  OWNER_PARENT_GUARDIAN: z.string().optional(),
  OWNER_GENDER: z.string().optional(),
  OWNER_NATIONALITY: z.string().optional(),
  MAX_PROFILE_IMAGE_MB: z.coerce.number().positive().default(5),
  MAX_CONTENT_IMAGE_MB: z.coerce.number().positive().default(8),
  MAX_RESUME_MB: z.coerce.number().positive().default(10),
  MAX_CERTIFICATE_MB: z.coerce.number().positive().default(10),
  MAX_DOCUMENT_MB: z.coerce.number().positive().default(15)
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export const webEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:5000/api/v1"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000")
});

export type WebEnv = z.infer<typeof webEnvSchema>;
