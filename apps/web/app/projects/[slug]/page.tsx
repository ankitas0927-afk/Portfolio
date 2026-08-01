import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/common/section";
import { MediaImage } from "@/components/common/media-image";
import { fetchProject } from "@/services/portfolio";
import { mediaDownloadUrl, mediaStreamUrl } from "@/lib/media";
import { compact } from "@/lib/utils";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await fetchProject(params.slug);
  const imageUrl = project?.openGraphImage?.id
    ? mediaStreamUrl(project.openGraphImage.id)
    : project?.thumbnail?.id
      ? mediaStreamUrl(project.thumbnail.id)
      : undefined;
  const description = project?.seoDescription || project?.shortDescription;
  const openGraph: NonNullable<Metadata["openGraph"]> = {
    title: project?.seoTitle || project?.title || "Project",
    type: "article",
    url: `${env.NEXT_PUBLIC_SITE_URL}/projects/${params.slug}`
  };
  if (description) {
    openGraph.description = description;
  }
  if (imageUrl) {
    openGraph.images = [{ url: imageUrl, width: 1200, height: 630, alt: project?.title || "Project" }];
  }
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: project?.seoTitle || project?.title || "Project",
    description: description || null,
    alternates: {
      canonical: `${env.NEXT_PUBLIC_SITE_URL}/projects/${params.slug}`
    },
    openGraph
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await fetchProject(params.slug);
  if (!project) {
    notFound();
  }

  const gallery = project.galleryImages;
  const documents = project.supportingDocuments;
  const timeline = compact([project.startDate, project.completionDate]).join(" - ");

  return (
    <Section title={project.title} eyebrow={project.category || "Project"} description={project.shortDescription}>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded shadow-soft">
            <MediaImage asset={project.thumbnail || project.openGraphImage} alt={project.title} priority />
          </div>
          {gallery.length ? (
            <div>
              <h2 className="text-lg font-semibold text-ink dark:text-white">Gallery</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {gallery.map((image) => (
                  <div key={image.id} className="overflow-hidden rounded border border-slate-200 dark:border-slate-800">
                    <MediaImage asset={image} alt={`${project.title} gallery image`} sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {documents.length ? (
            <div>
              <h2 className="text-lg font-semibold text-ink dark:text-white">Supporting files</h2>
              <div className="mt-3 space-y-2">
                {documents.map((document) => (
                  <a
                    key={document.id}
                    className="flex items-center justify-between rounded border border-slate-200 px-4 py-3 text-sm font-medium text-cobalt dark:border-slate-800 dark:text-teal-200"
                    href={mediaDownloadUrl(document.id)}
                  >
                    <span>{document.originalName}</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="space-y-6">
          <div className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-4 sm:grid-cols-2">
              {compact([project.projectStatus, project.duration, timeline, project.datePrecision]).map((item) => (
                <div key={item} className="rounded bg-mist px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
            {project.fullDescription ? <p className="mt-5 leading-8 text-slate-700 dark:text-slate-300">{project.fullDescription}</p> : null}
          </div>

          {project.objectives.length ? (
            <div className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-ink dark:text-white">Objectives</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                {project.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {project.problemStatement ? (
            <div className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-ink dark:text-white">Problem statement</h2>
              <p className="mt-3 leading-8 text-slate-700 dark:text-slate-300">{project.problemStatement}</p>
            </div>
          ) : null}

          {project.methodology ? (
            <div className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-ink dark:text-white">Methodology</h2>
              <p className="mt-3 leading-8 text-slate-700 dark:text-slate-300">{project.methodology}</p>
            </div>
          ) : null}

          {project.toolsAndTechnologies.length ? (
            <div className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-ink dark:text-white">Tools and technologies</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.toolsAndTechnologies.map((tool) => (
                  <span key={tool} className="rounded bg-teal-50 px-3 py-2 text-sm font-medium text-aqua dark:bg-teal-950/60">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {project.mainFeatures.length ? (
            <div className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-ink dark:text-white">Main features</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                {project.mainFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {project.challenges.length || project.solutions.length || project.outcomes.length || project.learningOutcomes.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {project.challenges.length ? (
                <div className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-semibold text-ink dark:text-white">Challenges</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                    {project.challenges.map((challenge) => (
                      <li key={challenge}>{challenge}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {project.solutions.length ? (
                <div className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-semibold text-ink dark:text-white">Solutions</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                    {project.solutions.map((solution) => (
                      <li key={solution}>{solution}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {project.outcomes.length ? (
                <div className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-semibold text-ink dark:text-white">Outcomes</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                    {project.outcomes.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {project.learningOutcomes.length ? (
                <div className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-semibold text-ink dark:text-white">Learning outcomes</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                    {project.learningOutcomes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {project.githubUrl ? (
              <a className="inline-flex items-center gap-2 rounded border border-slate-300 px-4 py-2 font-semibold" href={project.githubUrl}>
                GitHub
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
            {project.liveUrl ? (
              <a className="inline-flex items-center gap-2 rounded border border-slate-300 px-4 py-2 font-semibold" href={project.liveUrl}>
                Live
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
            {project.externalCaseStudyUrl ? (
              <a className="inline-flex items-center gap-2 rounded border border-slate-300 px-4 py-2 font-semibold" href={project.externalCaseStudyUrl}>
                Case study
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}
