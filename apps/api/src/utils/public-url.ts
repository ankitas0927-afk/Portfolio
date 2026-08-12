import { env } from '../config/env';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

const publicOrigin = env.API_PUBLIC_URL.trim()
  ? trimTrailingSlash(env.API_PUBLIC_URL)
  : null;

export function buildPublicApiUrl(pathname: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return publicOrigin ? `${publicOrigin}${normalizedPath}` : normalizedPath;
}

export function buildPublicMediaUrl(mediaId: string) {
  return buildPublicApiUrl(`/api/v1/public/media/${mediaId}`);
}
