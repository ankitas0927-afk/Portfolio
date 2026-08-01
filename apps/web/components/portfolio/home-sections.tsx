import Image from "next/image";
import Link from "next/link";
import type { SkillDto } from "@ankita-portfolio/shared-types";
import { ArrowRight, Sparkles } from "lucide-react";
import { MotionReveal } from "@/components/common/motion-reveal";
import { Section } from "@/components/common/section";
import { assetAlt, gridFsImageLoader } from "@/lib/media";

function skillBadge(value?: string | number): string | null {
  if (typeof value === "number") {
    return value > 0 ? `${value}+ yrs` : null;
  }
  return value && value.trim().length ? value : null;
}

export function WhatIDoSection({ skills }: { skills: SkillDto[] }) {
  return (
    <Section
      title="What I Do"
      eyebrow="Skills"
      description="Top 6 skills chosen in the admin panel and fetched from MongoDB."
      className="bg-mist/60 dark:bg-slate-950/40"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skills.map((skill, index) => (
          <MotionReveal key={skill.id} delay={index * 0.035}>
            <article className="group flex h-full flex-col rounded border border-slate-200 bg-white p-5 shadow-soft transition-all duration-200 ease-out hover:-translate-y-1 hover:border-aqua/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md border border-slate-200 bg-mist dark:border-slate-700 dark:bg-slate-950">
                  {skill.logoImage ? (
                    <Image
                      loader={gridFsImageLoader}
                      src={skill.logoImage.id}
                      alt={assetAlt(skill.logoImage, skill.name)}
                      width={48}
                      height={48}
                      sizes="48px"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Sparkles className="h-5 w-5 text-aqua" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-aqua">{skill.category.name}</p>
                  <h3 className="mt-1 text-lg font-semibold text-ink dark:text-white">{skill.name}</h3>
                </div>
              </div>
              {skill.description ? (
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{skill.description}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {skillBadge(skill.proficiencyLevel) ? (
                  <span className="rounded bg-teal-50 px-2 py-1 text-xs font-medium text-aqua dark:bg-teal-950/60">
                    {skillBadge(skill.proficiencyLevel)}
                  </span>
                ) : null}
                {skillBadge(skill.yearsOfExperience) ? (
                  <span className="rounded bg-mist px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {skillBadge(skill.yearsOfExperience)}
                  </span>
                ) : null}
              </div>
            </article>
          </MotionReveal>
        ))}
      </div>
    </Section>
  );
}

export function WorkTogetherSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-950 text-white dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <MotionReveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">Let&apos;s Work Together</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
            Have a project in mind? Let&apos;s create something amazing together.
          </h2>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded bg-white px-5 py-3 font-semibold text-slate-950 shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-50"
          >
            Start a Conversation
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </MotionReveal>
      </div>
    </section>
  );
}
