import { SectionHeading } from '@/components/common/section-heading';
import { getPublicEducation } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function EducationPage() {
  const education = await getPublicEducation();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="page-shell px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <SectionHeading
        eyebrow="Education"
        title="Academic background"
        description="Qualifications, milestones, and the learning foundation behind the portfolio."
      />
      <div className="mt-12 grid gap-6">
        {education.map((item) => (
          <article key={item.id} className="section-card hover-lift px-6 py-6">
            <h2 className="font-display text-2xl font-semibold">{item.qualification}</h2>
            <p className="mt-2 text-sm text-foreground/68">{item.institution}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.24em] text-accent/70">
              {[item.startDate, item.completionDate].filter(Boolean).join(' - ') || 'Academic record'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.fieldOfStudy ? <span className="info-chip">{item.fieldOfStudy}</span> : null}
              {item.grade ? <span className="info-chip">Grade: {item.grade}</span> : null}
              {item.percentage ? <span className="info-chip">Score: {item.percentage}</span> : null}
            </div>
          </article>
        ))}
      </div>
      </div>
    </div>
  );
}
