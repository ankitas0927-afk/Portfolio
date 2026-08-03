import type { ProjectDto, PublicPortfolioDto } from "@ankita-portfolio/shared-types";
import { cache } from "react";

function resolveApiBaseUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!configured) {
    return null;
  }

  if (process.env.VERCEL) {
    try {
      const hostname = new URL(configured).hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
        return null;
      }
    } catch {
      return null;
    }
  }

  return configured;
}

function memoize<T extends (...args: any[]) => any>(factory: T): T {
  return (typeof cache === "function" ? cache(factory) : factory) as T;
}

async function fetchJson<T>(path: string): Promise<T> {
  const apiBaseUrl = resolveApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error("API base URL is not available");
  }

  const controller = new AbortController();
  const timeoutMs = process.env.VERCEL ? 4000 : 10000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export const fetchPortfolio = memoize(async (): Promise<PublicPortfolioDto | null> => {
  try {
    return await fetchJson<PublicPortfolioDto>("/portfolio");
  } catch {
    return null;
  }
});

export const fetchProject = memoize(async (slug: string): Promise<ProjectDto | null> => {
  try {
    const result = await fetchJson<{ project: ProjectDto }>(`/projects/${slug}`);
    return result.project;
  } catch {
    return null;
  }
});
