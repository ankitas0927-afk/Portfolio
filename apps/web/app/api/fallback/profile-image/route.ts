import { readFile } from 'fs/promises';

import { resolveBundledAssetPath } from '@/lib/bundled-assets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const asset = await readFile(resolveBundledAssetPath('ankita-profile.png'));

    return new Response(asset, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Content-Type': 'image/png',
      },
    });
  } catch {
    return new Response('Bundled profile image not found.', { status: 404 });
  }
}
