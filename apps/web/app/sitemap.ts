import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { fetchPortfolio } from "@/services/portfolio";

const staticRoutes = ["/", "/about", "/experience", "/education", "/training", "/projects", "/resume", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const portfolio = await fetchPortfolio();
  const now = new Date();
  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${env.NEXT_PUBLIC_SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "/contact" || route === "/resume" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8
  }));

  for (const project of portfolio?.projects ?? []) {
    routes.push({
      url: `${env.NEXT_PUBLIC_SITE_URL}/projects/${project.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: project.isFeatured ? 0.9 : 0.7
    });
  }

  return routes;
}
