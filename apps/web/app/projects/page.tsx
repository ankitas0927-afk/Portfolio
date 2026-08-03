import Link from 'next/link';

import { SectionHeading } from '@/components/common/section-heading';
import { getPublicProjects } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Projects"
        title="Published projects"
        description="Draft projects remain private until they are published from the admin dashboard."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.24em] text-accent/70">{project.category || 'Project'}</p>
            <h2 className="mt-4 font-display text-2xl font-semibold">{project.title}</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/72">{project.shortDescription}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(project.toolsAndTechnologies ?? []).map((tool: string) => (
                <span key={tool} className="rounded-full border border-border/70 px-3 py-2 text-xs">
                  {tool}
                </span>
              ))}
            </div>
            <Link href={`/projects/${project.slug}`} className="mt-6 inline-flex text-sm font-semibold text-accent">
              View project
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
