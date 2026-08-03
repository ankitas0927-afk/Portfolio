import { SectionHeading } from '@/components/common/section-heading';
import { getPublicEducation } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function EducationPage() {
  const education = await getPublicEducation();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Education" title="Academic background" />
      <div className="mt-12 grid gap-6">
        {education.map((item) => (
          <article key={item.id} className="rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
            <h2 className="font-display text-2xl font-semibold">{item.qualification}</h2>
            <p className="mt-2 text-sm text-foreground/68">{item.institution}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.24em] text-accent/70">
              {[item.startDate, item.completionDate].filter(Boolean).join(' - ') || 'Academic record'}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
