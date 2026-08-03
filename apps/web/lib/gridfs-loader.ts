import type { ImageLoaderProps } from 'next/image';

function mapWidthToVariant(width: number) {
  if (width <= 180) return 'thumbnail';
  if (width <= 360) return 'small';
  if (width <= 768) return 'medium';
  return 'large';
}

export function gridFsImageLoader({ src, width }: ImageLoaderProps) {
  const joiner = src.includes('?') ? '&' : '?';
  return `${src}${joiner}variant=${mapWidthToVariant(width)}`;
}
