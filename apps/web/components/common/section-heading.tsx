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
    <div className={cn('max-w-3xl space-y-4', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? (
        <div className={cn('inline-flex items-center gap-3', align === 'center' && 'justify-center')}>
          <span className="h-2.5 w-2.5 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] shadow-[0_0_22px_rgba(29,78,216,0.42)]" />
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent/80">{eyebrow}</p>
        </div>
      ) : null}
      <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="text-base leading-8 text-foreground/72">{description}</p> : null}
      <div
        className={cn(
          'h-px w-24 bg-[linear-gradient(90deg,var(--accent),rgba(29,78,216,0.35),transparent)]',
          align === 'center' && 'mx-auto',
        )}
      />
    </div>
  );
}
