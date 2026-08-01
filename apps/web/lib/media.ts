import type { ImageLoader } from "next/image";
import type { MediaAssetDto } from "@ankita-portfolio/shared-types";
import { env } from "./env";

export function mediaStreamUrl(assetId: string, variant = "original"): string {
  return `${env.NEXT_PUBLIC_API_BASE_URL}/media/${assetId}/stream?variant=${variant}`;
}

export function mediaDownloadUrl(assetId: string): string {
  return `${env.NEXT_PUBLIC_API_BASE_URL}/media/${assetId}/download`;
}

function variantForWidth(width: number): string {
  if (width <= 360) {
    return "thumbnail";
  }
  if (width <= 720) {
    return "small";
  }
  if (width <= 1080) {
    return "medium";
  }
  return "large";
}

export const gridFsImageLoader: ImageLoader = ({ src, width }) =>
  mediaStreamUrl(src, variantForWidth(width));

export function assetAlt(asset: MediaAssetDto | undefined, fallback: string): string {
  return asset?.altText || fallback;
}
