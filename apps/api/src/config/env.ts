import 'dotenv/config';

import { z } from 'zod';

function isValidOptionalUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().trim().min(1, 'MONGODB_URI is required'),
  FRONTEND_URL: z.string().trim().url('FRONTEND_URL must be a valid URL'),
  FRONTEND_URLS: z.string().trim().optional().default(''),
  API_PUBLIC_URL: z
    .string()
    .trim()
    .default('')
    .refine(isValidOptionalUrl, 'API_PUBLIC_URL must be a valid URL'),
  JWT_ACCESS_SECRET: z.string().trim().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z
    .string()
    .trim()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().trim().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().trim().default('7d'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  ADMIN_NAME: z.string().trim().min(1),
  ADMIN_EMAIL: z.string().trim().email(),
  ADMIN_INITIAL_PASSWORD: z.string().min(10),
  RESUME_PDF_PATH: z.string().trim().min(1),
  PROFILE_IMAGE_PATH: z.string().trim().optional().default(''),
  OWNER_PUBLIC_EMAIL: z.string().trim().optional().default(''),
  OWNER_PRIVATE_EMAIL: z.string().trim().optional().default(''),
  OWNER_PUBLIC_PHONE: z.string().trim().optional().default(''),
  OWNER_PRIVATE_PHONE: z.string().trim().optional().default(''),
  OWNER_CITY: z.string().trim().optional().default(''),
  OWNER_STATE: z.string().trim().optional().default(''),
  OWNER_COUNTRY: z.string().trim().optional().default(''),
  OWNER_PRIVATE_ADDRESS: z.string().trim().optional().default(''),
  OWNER_DATE_OF_BIRTH: z.string().trim().optional().default(''),
  OWNER_PARENT_GUARDIAN: z.string().trim().optional().default(''),
  OWNER_GENDER: z.string().trim().optional().default(''),
  OWNER_NATIONALITY: z.string().trim().optional().default(''),
  MAX_PROFILE_IMAGE_MB: z.coerce.number().positive().default(5),
  MAX_CONTENT_IMAGE_MB: z.coerce.number().positive().default(8),
  MAX_RESUME_MB: z.coerce.number().positive().default(10),
  MAX_CERTIFICATE_MB: z.coerce.number().positive().default(10),
  MAX_DOCUMENT_MB: z.coerce.number().positive().default(15),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration:\n${parsed.error.issues
      .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')}`,
  );
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';

const extraFrontendOrigins = env.FRONTEND_URLS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

for (const origin of extraFrontendOrigins) {
  try {
    new URL(origin);
  } catch {
    throw new Error(
      `Invalid environment configuration:\n- FRONTEND_URLS: ${origin} must be a valid URL`,
    );
  }
}

export const frontendOriginAllowlist = Array.from(
  new Set([env.FRONTEND_URL, ...extraFrontendOrigins]),
);
