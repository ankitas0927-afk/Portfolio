import type { NextRequest } from 'next/server';

import { apiRuntimeEnv, getUpstreamApiBaseUrl } from '@/lib/api-base-url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildProxyHeaders(headers: Headers) {
  const forwardedHeaders = new Headers(headers);
  forwardedHeaders.delete('connection');
  forwardedHeaders.delete('content-length');
  forwardedHeaders.delete('host');
  forwardedHeaders.delete('x-forwarded-host');
  forwardedHeaders.delete('x-forwarded-proto');
  return forwardedHeaders;
}

function buildErrorResponse(message: string, code: string, status = 503) {
  return Response.json(
    {
      success: false,
      error: {
        message,
        code,
      },
    },
    { status },
  );
}

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
) {
  const upstreamApiBaseUrl = getUpstreamApiBaseUrl();
  const { path } = await params;

  if (!upstreamApiBaseUrl) {
    return buildErrorResponse(
      'The portfolio API base URL is not configured for this deployment.',
      'API_BASE_URL_MISSING',
    );
  }

  const requestUrl = new URL(request.url);
  const upstreamPath = path.join('/');
  const upstreamUrl = new URL(`${upstreamApiBaseUrl}/${upstreamPath}`);
  upstreamUrl.search = requestUrl.search;

  if (
    apiRuntimeEnv.vercelOrigin &&
    upstreamUrl.origin === apiRuntimeEnv.vercelOrigin &&
    upstreamUrl.pathname.startsWith('/api/v1/')
  ) {
    return buildErrorResponse(
      'The website API proxy is pointing back to itself. Set NEXT_PUBLIC_API_BASE_URL to the public API deployment URL.',
      'API_PROXY_LOOP',
      500,
    );
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: buildProxyHeaders(request.headers),
      body:
        request.method === 'GET' || request.method === 'HEAD'
          ? undefined
          : await request.arrayBuffer(),
      cache: 'no-store',
      redirect: 'manual',
    });

    const responseHeaders = new Headers();
    upstreamResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'content-length') {
        return;
      }

      responseHeaders.append(key, value);
    });

    const setCookies =
      (
        upstreamResponse.headers as Headers & {
          getSetCookie?: () => string[];
        }
      ).getSetCookie?.() ?? [];

    if (setCookies.length > 0) {
      responseHeaders.delete('set-cookie');
      for (const cookie of setCookies) {
        responseHeaders.append('set-cookie', cookie);
      }
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return buildErrorResponse(
      'The website cannot reach the portfolio API right now. Check the public API deployment URL and access settings.',
      'UPSTREAM_API_UNAVAILABLE',
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context.params);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context.params);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context.params);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context.params);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context.params);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context.params);
}
