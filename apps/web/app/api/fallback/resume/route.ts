import { readFile } from 'fs/promises';

import { resolveBundledAssetPath } from '@/lib/bundled-assets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const asset = await readFile(resolveBundledAssetPath('ankita-resume.pdf'));
    const url = new URL(request.url);
    const isDownload = url.searchParams.get('download') === '1';

    return new Response(asset, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="ankita-resume.pdf"`,
        'Content-Type': 'application/pdf',
      },
    });
  } catch {
    return new Response('Bundled resume not found.', { status: 404 });
  }
}
