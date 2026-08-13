import { SectionHeading } from '@/components/common/section-heading';
import { getTotalExperienceLabel } from '@/lib/experience';
import { getPublicExperience, getPublicSkills } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  const [skills, experience] = await Promise.all([getPublicSkills(), getPublicExperience()]);
  const hasContent = skills.categories.length > 0 || skills.personalSkills.length > 0;
  const overallExperienceLabel = getTotalExperienceLabel(experience);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="page-shell px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <SectionHeading
        eyebrow="Skills"
        title="Technical skills and personal strengths"
        description="Technical capability, software familiarity, and personal strengths presented with clarity."
      />
      {overallExperienceLabel ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="info-chip">{overallExperienceLabel}</span>
        </div>
      ) : null}

      {hasContent ? (
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 section-card px-6 py-6">
            {skills.categories.map((category) => {
              const categorySkills = skills.skills.filter((skill) => skill.categoryId === category.id);

              return (
                <section key={category.id} className="metric-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
                    {category.name}
                  </p>
                  {category.description ? (
                    <p className="mt-3 text-sm leading-7 text-foreground/68">{category.description}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span key={skill.id} className="info-chip">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="section-card px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">Personal strengths</p>
            <div className="mt-4 grid gap-3">
              {skills.personalSkills.map((skill) => (
                <div key={skill.id} className="metric-card">
                  <p className="text-sm font-semibold text-foreground">{skill.title}</p>
                  {skill.description ? (
                    <p className="mt-2 text-sm leading-7 text-foreground/68">{skill.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="section-card mt-12 px-6 py-6">
          <p className="text-sm leading-7 text-foreground/72">
            Skills and strengths will appear here soon.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
