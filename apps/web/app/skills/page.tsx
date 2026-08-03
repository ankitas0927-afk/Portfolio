import { SectionHeading } from '@/components/common/section-heading';
import { getPublicSkills } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  const skills = await getPublicSkills();
  const hasContent = skills.categories.length > 0 || skills.personalSkills.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Skills"
        title="Technical skills and personal strengths"
        description="Technical capability, software familiarity, and personal strengths presented with clarity."
      />

      {hasContent ? (
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
            {skills.categories.map((category) => {
              const categorySkills = skills.skills.filter((skill) => skill.categoryId === category.id);

              return (
                <section key={category.id} className="rounded-[1.5rem] border border-border/60 bg-background/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
                    {category.name}
                  </p>
                  {category.description ? (
                    <p className="mt-3 text-sm leading-7 text-foreground/68">{category.description}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-full border border-border/70 px-3 py-2 text-sm text-foreground/75"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-background/75 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">Personal strengths</p>
            <div className="mt-4 grid gap-3">
              {skills.personalSkills.map((skill) => (
                <div key={skill.id} className="rounded-2xl border border-border/60 bg-card/85 px-4 py-3">
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
        <div className="mt-12 rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
          <p className="text-sm leading-7 text-foreground/72">
            Skills and strengths will appear here soon.
          </p>
        </div>
      )}
    </div>
  );
}
