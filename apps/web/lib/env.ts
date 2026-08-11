const vercelOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const serverFallbackApiBaseUrl = vercelOrigin
  ? `${vercelOrigin}/api/v1`
  : 'http://localhost:5000/api/v1';
const browserFallbackApiBaseUrl =
  process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:5000/api/v1';

export const webEnv = {
  apiBaseUrl:
    process.env.INTERNAL_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    serverFallbackApiBaseUrl,
  browserApiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? browserFallbackApiBaseUrl,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};
