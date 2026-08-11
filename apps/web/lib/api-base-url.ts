const defaultLocalApiBaseUrl = 'http://localhost:5000/api/v1';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function normaliseApiBaseUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const withoutTrailingSlash = trimTrailingSlash(trimmed);
  return withoutTrailingSlash.endsWith('/api/v1')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api/v1`;
}

export const apiRuntimeEnv = {
  defaultLocalApiBaseUrl,
  isVercelDeployment: Boolean(process.env.VERCEL_URL),
  vercelOrigin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  publicApiBaseUrl: normaliseApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL),
  internalApiBaseUrl: normaliseApiBaseUrl(process.env.INTERNAL_API_BASE_URL),
  apiPublicUrl: normaliseApiBaseUrl(process.env.API_PUBLIC_URL),
  upstreamProtectionBypassSecret:
    process.env.UPSTREAM_VERCEL_PROTECTION_BYPASS_SECRET?.trim() || null,
};

export function getUpstreamApiBaseUrl() {
  if (apiRuntimeEnv.isVercelDeployment) {
    return (
      apiRuntimeEnv.publicApiBaseUrl ??
      apiRuntimeEnv.apiPublicUrl ??
      apiRuntimeEnv.internalApiBaseUrl ??
      apiRuntimeEnv.defaultLocalApiBaseUrl
    );
  }

  return (
    apiRuntimeEnv.internalApiBaseUrl ??
    apiRuntimeEnv.publicApiBaseUrl ??
    apiRuntimeEnv.apiPublicUrl ??
    apiRuntimeEnv.defaultLocalApiBaseUrl
  );
}

export function hasExplicitUpstreamApiBaseUrl() {
  return Boolean(
    apiRuntimeEnv.publicApiBaseUrl ??
      apiRuntimeEnv.internalApiBaseUrl ??
      apiRuntimeEnv.apiPublicUrl,
  );
}
