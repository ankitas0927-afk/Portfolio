import type { NavigationItem } from '@ankita-portfolio/shared-types';

const primaryNavigationBlueprint = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Experience', href: '/experience' },
  { label: 'Skills', href: '/skills' },
  { label: 'Projects', href: '/projects' },
  { label: 'Resume', href: '/resume' },
  { label: 'Contact', href: '/contact' },
] as const;

function normalizeHref(href: string) {
  const normalized = href.trim().replace(/\/+$/, '');
  return normalized || '/';
}

export const defaultPrimaryNavigation: NavigationItem[] = primaryNavigationBlueprint.map((item, index) => ({
  id: `default-nav-${index}`,
  label: item.label,
  href: item.href,
  opensInNewTab: false,
  publicationStatus: 'published',
  displayOrder: index,
}));

export function resolvePrimaryNavigation(items: NavigationItem[]): NavigationItem[] {
  const itemsByHref = new Map(items.map((item) => [normalizeHref(item.href), item]));

  return primaryNavigationBlueprint.map((item, index) => {
    const matched = itemsByHref.get(normalizeHref(item.href));

    return {
      id: matched?.id ?? `primary-nav-${index}`,
      label: matched?.label ?? item.label,
      href: matched?.href ?? item.href,
      opensInNewTab: matched?.opensInNewTab ?? false,
      publicationStatus: matched?.publicationStatus ?? 'published',
      displayOrder: matched?.displayOrder ?? index,
    };
  });
}
