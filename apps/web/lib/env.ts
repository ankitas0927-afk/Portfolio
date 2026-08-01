import { webEnvSchema } from "@ankita-portfolio/config";

const vercelSiteUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

const parsed = webEnvSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? vercelSiteUrl
});

export const env = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:5000/api/v1",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000"
    };
