const defaultLocalApiBaseUrl = 'http://localhost:5000/api/v1';
const vercelOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const serverFallbackApiBaseUrl = vercelOrigin
  ? `${vercelOrigin}/api/v1`
  : defaultLocalApiBaseUrl;
const browserFallbackApiBaseUrl =
  process.env.NODE_ENV === 'production' ? '/api/v1' : defaultLocalApiBaseUrl;

export const webEnv = {
  apiBaseUrl:
    process.env.INTERNAL_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    serverFallbackApiBaseUrl,
  // Keep browser requests same-origin in production so auth and cookies flow through the web app.
  browserApiBaseUrl:
    process.env.NODE_ENV === 'production'
      ? browserFallbackApiBaseUrl
      : process.env.NEXT_PUBLIC_API_BASE_URL ?? browserFallbackApiBaseUrl,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};
