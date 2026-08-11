import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@ankita-portfolio/config',
    '@ankita-portfolio/shared-types',
    '@ankita-portfolio/validation',
  ],
};

export default nextConfig;
