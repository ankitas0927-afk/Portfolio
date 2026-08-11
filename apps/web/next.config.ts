import type { NextConfig } from 'next';

const apiProxyTarget = (
  process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  transpilePackages: [
    '@ankita-portfolio/config',
    '@ankita-portfolio/shared-types',
    '@ankita-portfolio/validation',
  ],
  async rewrites() {
    if (!apiProxyTarget) {
      return [];
    }

    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
