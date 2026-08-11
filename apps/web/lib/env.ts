import { apiRuntimeEnv, getUpstreamApiBaseUrl } from './api-base-url';

const serverFallbackApiBaseUrl = apiRuntimeEnv.vercelOrigin
  ? `${apiRuntimeEnv.vercelOrigin}/api/v1`
  : apiRuntimeEnv.defaultLocalApiBaseUrl;
const browserFallbackApiBaseUrl =
  process.env.NODE_ENV === 'production' ? '/api/v1' : apiRuntimeEnv.defaultLocalApiBaseUrl;

export const webEnv = {
  apiBaseUrl:
    apiRuntimeEnv.isVercelDeployment ? serverFallbackApiBaseUrl : getUpstreamApiBaseUrl(),
  browserApiBaseUrl:
    process.env.NODE_ENV === 'production'
      ? browserFallbackApiBaseUrl
      : apiRuntimeEnv.publicApiBaseUrl ?? browserFallbackApiBaseUrl,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};
