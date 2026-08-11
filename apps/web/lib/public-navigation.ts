import type { NavigationItem } from '@ankita-portfolio/shared-types';

function normalizeHref(href: string) {
  const normalized = href.trim().replace(/\/+$/, '');
  return normalized || '/';
}

export function resolvePrimaryNavigation(items: NavigationItem[]): NavigationItem[] {
  return [...items]
    .filter((item) => item.label.trim().length > 0 && item.href.trim().length > 0)
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((item) => ({
      ...item,
      href: normalizeHref(item.href),
    }));
}
