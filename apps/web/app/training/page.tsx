import { SectionHeading } from '@/components/common/section-heading';
import { getPublicTraining } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function TrainingPage() {
  const training = await getPublicTraining();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="page-shell px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <SectionHeading
        eyebrow="Training"
        title="Professional training"
        description="Focused practical exposure, structured learning, and industry-facing preparation."
      />
      <div className="mt-12 grid gap-6">
        {training.map((item) => (
          <article key={item.id} className="section-card hover-lift px-6 py-6">
            <p className="text-xs uppercase tracking-[0.24em] text-accent/70">{item.duration || item.trainingType}</p>
            <h2 className="mt-4 font-display text-2xl font-semibold">
              {item.trainingTitle || item.department || 'Professional training'}
            </h2>
            <p className="mt-2 text-sm text-foreground/68">{item.organisation}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.location ? <span className="info-chip">{item.location}</span> : null}
              {item.department ? <span className="info-chip">{item.department}</span> : null}
            </div>
            {item.description ? <p className="mt-4 text-sm leading-7 text-foreground/72">{item.description}</p> : null}
          </article>
        ))}
      </div>
      </div>
    </div>
  );
}
