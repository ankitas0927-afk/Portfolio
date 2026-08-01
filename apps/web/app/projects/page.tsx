import type { Metadata } from "next";
import Link from "next/link";
import { ProjectsSection } from "@/components/portfolio/content-sections";
import { fetchPortfolio } from "@/services/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "Published project work for Ankita Singh."
};

type ProjectsPageProps = {
  searchParams?: {
    category?: string | string[] | undefined;
    featured?: string | string[] | undefined;
  };
};

function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const portfolio = await fetchPortfolio();
  const projects = portfolio?.projects ?? [];
  const category = queryValue(searchParams?.category);
  const featured = queryValue(searchParams?.featured) === "1";
  const categories = [...new Set(projects.map((project) => project.category).filter((value): value is string => Boolean(value)))];
  const filteredProjects = projects.filter((project) => {
    const matchesCategory = !category || project.category === category;
    const matchesFeatured = !featured || project.isFeatured;
    return matchesCategory && matchesFeatured;
  });

  const linkFor = (nextCategory: string, nextFeatured = featured) => {
    const params = new URLSearchParams();
    if (nextCategory) {
      params.set("category", nextCategory);
    }
    if (nextFeatured) {
      params.set("featured", "1");
    }
    return {
      pathname: "/projects" as const,
      query: Object.fromEntries(params.entries())
    };
  };

  return (
    <>
      <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href={linkFor("", false)}
          className={`rounded-full border px-3 py-2 text-sm font-medium ${!category && !featured ? "border-aqua bg-teal-50 text-aqua dark:bg-teal-950/60" : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}
        >
          All
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            href={linkFor(item)}
            className={`rounded-full border px-3 py-2 text-sm font-medium ${category === item ? "border-aqua bg-teal-50 text-aqua dark:bg-teal-950/60" : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}
          >
            {item}
          </Link>
        ))}
        <Link
          href={linkFor(category, !featured)}
          className={`rounded-full border px-3 py-2 text-sm font-medium ${featured ? "border-aqua bg-teal-50 text-aqua dark:bg-teal-950/60" : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}
        >
          Featured
        </Link>
      </div>
      <ProjectsSection projects={filteredProjects} />
    </>
  );
}
