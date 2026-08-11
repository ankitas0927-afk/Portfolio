import type { NavigationItem } from '@ankita-portfolio/shared-types';

const defaultNavigation: NavigationItem[] = [
  {
    id: 'fallback-home',
    label: 'Home',
    href: '/',
    opensInNewTab: false,
    publicationStatus: 'published',
    displayOrder: 0,
  },
  {
    id: 'fallback-about',
    label: 'About',
    href: '/about',
    opensInNewTab: false,
    publicationStatus: 'published',
    displayOrder: 1,
  },
  {
    id: 'fallback-experience',
    label: 'Experience',
    href: '/experience',
    opensInNewTab: false,
    publicationStatus: 'published',
    displayOrder: 2,
  },
  {
    id: 'fallback-skills',
    label: 'Skills',
    href: '/skills',
    opensInNewTab: false,
    publicationStatus: 'published',
    displayOrder: 3,
  },
  {
    id: 'fallback-projects',
    label: 'Projects',
    href: '/projects',
    opensInNewTab: false,
    publicationStatus: 'published',
    displayOrder: 4,
  },
  {
    id: 'fallback-resume',
    label: 'Resume',
    href: '/resume',
    opensInNewTab: false,
    publicationStatus: 'published',
    displayOrder: 5,
  },
  {
    id: 'fallback-contact',
    label: 'Contact',
    href: '/contact',
    opensInNewTab: false,
    publicationStatus: 'published',
    displayOrder: 6,
  },
];

function normalizeHref(href: string) {
  const normalized = href.trim().replace(/\/+$/, '');
  return normalized || '/';
}

export function resolvePrimaryNavigation(items: NavigationItem[]): NavigationItem[] {
  const navigationItems = items.length > 0 ? items : defaultNavigation;

  return [...navigationItems]
    .filter((item) => item.label.trim().length > 0 && item.href.trim().length > 0)
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((item) => ({
      ...item,
      href: normalizeHref(item.href),
    }));
}
