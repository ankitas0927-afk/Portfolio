import type { MetadataRoute } from 'next';

import { webEnv } from '@/lib/env';
import { getNavigation, getPublicProjects } from '@/services/public';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [navigation, projects] = await Promise.all([getNavigation(), getPublicProjects()]);
  const staticRoutes = navigation.map((item) => ({
    url: `${webEnv.siteUrl}${item.href}`,
    lastModified: new Date(),
  }));

  const projectRoutes = projects.map((project) => ({
    url: `${webEnv.siteUrl}/projects/${project.slug}`,
    lastModified: new Date(),
  }));

  return [{ url: webEnv.siteUrl, lastModified: new Date() }, ...staticRoutes, ...projectRoutes];
}
