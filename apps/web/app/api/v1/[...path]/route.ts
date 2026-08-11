import type { NextRequest } from 'next/server';

import {
  apiRuntimeEnv,
  getUpstreamApiBaseUrl,
  hasExplicitUpstreamApiBaseUrl,
} from '@/lib/api-base-url';

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

function isProtectedDeploymentResponse(response: Response) {
  const redirectLocation = response.headers.get('location') ?? '';
  const hasProtectionNonce =
    response.headers.get('set-cookie')?.includes('_vercel_sso_nonce') ?? false;

  return (
    (response.status === 302 && redirectLocation.includes('vercel.com/sso-api')) ||
    (response.status === 401 && redirectLocation.includes('vercel.com/sso-api')) ||
    hasProtectionNonce
  );
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

  if (apiRuntimeEnv.isVercelDeployment && !hasExplicitUpstreamApiBaseUrl()) {
    return buildErrorResponse(
      'The portfolio API base URL is missing for this Vercel deployment. Set NEXT_PUBLIC_API_BASE_URL or API_PUBLIC_URL to the public API deployment URL.',
      'API_BASE_URL_MISSING',
    );
  }

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
    const upstreamHeaders = buildProxyHeaders(request.headers);
    if (apiRuntimeEnv.upstreamProtectionBypassSecret) {
      upstreamHeaders.set(
        'x-vercel-protection-bypass',
        apiRuntimeEnv.upstreamProtectionBypassSecret,
      );
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: upstreamHeaders,
      body:
        request.method === 'GET' || request.method === 'HEAD'
          ? undefined
          : await request.arrayBuffer(),
      cache: 'no-store',
      redirect: 'manual',
    });

    if (isProtectedDeploymentResponse(upstreamResponse)) {
      return buildErrorResponse(
        'The portfolio API is protected by Vercel Authentication. Either disable API deployment protection for the public API or set UPSTREAM_VERCEL_PROTECTION_BYPASS_SECRET in the web deployment.',
        'UPSTREAM_API_PROTECTED',
      );
    }

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
