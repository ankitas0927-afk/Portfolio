import Image from "next/image";
import type { MediaAssetDto } from "@ankita-portfolio/shared-types";
import { assetAlt, gridFsImageLoader } from "@/lib/media";
import { cn } from "@/lib/utils";

type MediaImageProps = {
  asset?: MediaAssetDto | undefined;
  alt: string;
  className?: string | undefined;
  priority?: boolean | undefined;
  sizes?: string | undefined;
};

export function MediaImage({ asset, alt, className, priority, sizes }: MediaImageProps) {
  if (!asset) {
    return (
      <div
        className={cn(
          "flex h-full min-h-60 w-full items-center justify-center bg-gradient-to-br from-white via-teal-50 to-blue-50 text-5xl font-semibold text-aqua dark:from-slate-900 dark:via-slate-800 dark:to-teal-950",
          className,
        )}
        aria-label={alt}
      >
        AS
      </div>
    );
  }

  return (
    <Image
      loader={gridFsImageLoader}
      src={asset.id}
      alt={assetAlt(asset, alt)}
      width={asset.width || 960}
      height={asset.height || 960}
      priority={priority}
      sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
