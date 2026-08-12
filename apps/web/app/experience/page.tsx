import { SectionHeading } from '@/components/common/section-heading';
import { getPublicExperience } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function ExperiencePage() {
  const experience = await getPublicExperience();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="page-shell px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <SectionHeading
        eyebrow="Experience"
        title="Work experience"
        description="A concise overview of professional roles, responsibilities, and career growth."
      />
      <div className="mt-12 space-y-6">
        {experience.map((item) => (
          <article key={item.id} className="section-card hover-lift px-6 py-6">
            <p className="text-xs uppercase tracking-[0.24em] text-accent/70">
              {item.approximateDuration || item.location || 'Experience'}
            </p>
            <h2 className="mt-4 font-display text-2xl font-semibold">{item.jobTitle}</h2>
            <p className="mt-1 text-sm text-foreground/68">{item.organisation}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.location ? <span className="info-chip">{item.location}</span> : null}
              {item.employmentType ? <span className="info-chip">{item.employmentType}</span> : null}
              {item.isCurrentPosition ? <span className="info-chip">Current role</span> : null}
            </div>
            {item.professionalSummary ? (
              <p className="mt-4 text-sm leading-7 text-foreground/72">{item.professionalSummary}</p>
            ) : null}
          </article>
        ))}
      </div>
      </div>
    </div>
  );
}
