import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div
      className={cn(
        'max-w-3xl space-y-4 reveal-up sm:space-y-5',
        align === 'center' && 'mx-auto text-center',
      )}
    >
      {eyebrow ? (
        <div
          className={cn(
            'inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/88 px-4 py-2 shadow-[0_12px_24px_-20px_rgba(10,28,52,0.45)] backdrop-blur-xl',
            align === 'center' && 'justify-center',
          )}
        >
          <span className="ambient-dot h-2.5 w-2.5 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] shadow-[0_0_22px_rgba(29,78,216,0.42)]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent/85 sm:text-xs sm:tracking-[0.35em]">
            {eyebrow}
          </p>
        </div>
      ) : null}
      <h2 className="max-w-4xl text-balance font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.95rem] lg:leading-[1.05]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-3xl text-[0.98rem] leading-7 text-foreground/78 sm:text-[1.05rem] sm:leading-8">
          {description}
        </p>
      ) : null}
      <div
        className={cn(
          'h-px w-32 bg-[linear-gradient(90deg,var(--accent),rgba(29,78,216,0.52),rgba(45,212,191,0.28),transparent)]',
          align === 'center' && 'mx-auto',
        )}
      />
    </div>
  );
}
