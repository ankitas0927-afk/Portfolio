export const webEnv = {
  apiBaseUrl:
    process.env.INTERNAL_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    'http://localhost:5000/api/v1',
  browserApiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};
