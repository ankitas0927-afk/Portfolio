'use client';

import Image from 'next/image';

import { gridFsImageLoader } from '@/lib/gridfs-loader';
import { cn } from '@/lib/utils';

type PortfolioImageProps = {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function PortfolioImage({
  src,
  alt,
  width = 720,
  height = 720,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: PortfolioImageProps) {
  if (!src) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-[2rem] border border-dashed border-border/60 bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.15),_transparent_50%),linear-gradient(135deg,_rgba(15,118,110,0.12),_rgba(29,78,216,0.08))]',
          className,
        )}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      loader={gridFsImageLoader}
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
