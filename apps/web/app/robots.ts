import type { MetadataRoute } from 'next';

import { webEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin'],
    },
    sitemap: `${webEnv.siteUrl}/sitemap.xml`,
  };
}
