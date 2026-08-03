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
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent/80">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="text-base leading-8 text-foreground/72">{description}</p> : null}
    </div>
  );
}
