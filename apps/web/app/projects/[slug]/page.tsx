import type { Metadata } from 'next';
import Link from 'next/link';

import { SectionHeading } from '@/components/common/section-heading';
import { getPublicProject } from '@/services/public';
import { webEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProject(slug);

  return {
    title: project?.seo?.title ?? project?.title ?? 'Project',
    description: project?.seo?.description ?? project?.shortDescription ?? 'Project details',
    openGraph: {
      title: project?.seo?.title ?? project?.title ?? 'Project',
      description: project?.seo?.description ?? project?.shortDescription ?? 'Project details',
      url: `${webEnv.siteUrl}/projects/${slug}`,
    },
  };
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublicProject(slug);

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Projects" title="Project not found" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow={project.category || 'Project'}
        title={project.title}
        description={project.fullDescription || project.shortDescription}
      />
      <div className="mt-10 rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.24em] text-accent/70">
          {project.duration || project.status || 'Project'}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {(project.toolsAndTechnologies ?? []).map((tool: string) => (
            <span key={tool} className="rounded-full border border-border/70 px-3 py-2 text-xs">
              {tool}
            </span>
          ))}
        </div>
        {project.githubUrl ? (
          <div className="mt-8">
            <Link href={project.githubUrl} className="text-sm font-semibold text-accent">
              Open GitHub reference
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
