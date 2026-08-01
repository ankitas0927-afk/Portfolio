import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MotionReveal } from "@/components/common/motion-reveal";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Section({ id, eyebrow, title, description, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          {eyebrow ? (
            <MotionReveal delay={0.02}>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-aqua">{eyebrow}</p>
            </MotionReveal>
          ) : null}
          <MotionReveal delay={0.06}>
            <h2 className="text-3xl font-semibold text-ink dark:text-white sm:text-4xl">{title}</h2>
          </MotionReveal>
          {description ? (
            <MotionReveal delay={0.1}>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
            </MotionReveal>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
