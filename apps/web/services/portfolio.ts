import type { ProjectDto, PublicPortfolioDto } from "@ankita-portfolio/shared-types";
import { cache } from "react";
import { env } from "@/lib/env";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" }
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export const fetchPortfolio = cache(async (): Promise<PublicPortfolioDto | null> => {
  try {
    return await fetchJson<PublicPortfolioDto>("/portfolio");
  } catch {
    return null;
  }
});

export const fetchProject = cache(async (slug: string): Promise<ProjectDto | null> => {
  try {
    const result = await fetchJson<{ project: ProjectDto }>(`/projects/${slug}`);
    return result.project;
  } catch {
    return null;
  }
});
