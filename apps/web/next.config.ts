import path from 'path';
import { fileURLToPath } from 'url';

import type { NextConfig } from 'next';

const appDirectory = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: path.resolve(appDirectory, '../..'),
  serverExternalPackages: [
    'bcrypt',
    'compression',
    'cookie-parser',
    'cors',
    'dotenv',
    'express',
    'express-mongo-sanitize',
    'express-rate-limit',
    'file-type',
    'helmet',
    'jsonwebtoken',
    'mongoose',
    'ms',
    'multer',
    'pino',
    'pino-pretty',
    'sharp',
  ],
  transpilePackages: [
    '@ankita-portfolio/config',
    '@ankita-portfolio/shared-types',
    '@ankita-portfolio/validation',
  ],
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /mongodb[\\/]lib[\\/]deps\.js$/,
        message: /aws4/,
      },
      {
        module: /sharp[\\/]lib[\\/]libvips\.js$/,
        message: /@img\/sharp-libvips-dev\/(include|cplusplus)/,
      },
      {
        module: /sharp[\\/]lib[\\/]utility\.js$/,
        message: /@img\/sharp-wasm32\/versions/,
      },
    ];

    return config;
  },
};

export default nextConfig;
