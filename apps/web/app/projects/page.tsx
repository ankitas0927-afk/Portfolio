import Link from 'next/link';

import { SectionHeading } from '@/components/common/section-heading';
import { getPublicProjects } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="page-shell px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <SectionHeading
        eyebrow="Projects"
        title="Published projects"
        description="A selection of practical work, case studies, and published project highlights."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="section-card hover-lift px-6 py-6">
            <p className="text-xs uppercase tracking-[0.24em] text-accent/70">{project.category || 'Project'}</p>
            <h2 className="mt-4 font-display text-2xl font-semibold">{project.title}</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/72">{project.shortDescription}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(project.toolsAndTechnologies ?? []).map((tool: string) => (
                <span key={tool} className="info-chip text-xs">
                  {tool}
                </span>
              ))}
            </div>
            <Link href={`/projects/${project.slug}`} className="ghost-button mt-6 inline-flex">
              View project
            </Link>
          </article>
        ))}
      </div>
      </div>
    </div>
  );
}
