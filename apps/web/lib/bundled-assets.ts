import { existsSync } from 'fs';
import path from 'path';

const bundledAssetCandidates = [
  path.resolve(process.cwd(), 'apps/api/seed-assets'),
  path.resolve(process.cwd(), '../api/seed-assets'),
  path.resolve(process.cwd(), '../../apps/api/seed-assets'),
];

export function resolveBundledAssetPath(fileName: string) {
  for (const candidate of bundledAssetCandidates) {
    const assetPath = path.join(candidate, fileName);
    if (existsSync(assetPath)) {
      return assetPath;
    }
  }

  throw new Error(`Bundled asset not found: ${fileName}`);
}
