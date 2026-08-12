const defaultLocalSiteUrl = 'http://localhost:3000';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function normaliseUrl(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimTrailingSlash(trimmed || fallback);
}

const deploymentOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : normaliseUrl(process.env.NEXT_PUBLIC_SITE_URL, defaultLocalSiteUrl);

export const webEnv = {
  apiBaseUrl: `${deploymentOrigin}/api/v1`,
  browserApiBaseUrl: '/api/v1',
  siteUrl: normaliseUrl(process.env.NEXT_PUBLIC_SITE_URL, deploymentOrigin),
};
