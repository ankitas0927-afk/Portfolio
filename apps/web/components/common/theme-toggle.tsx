'use client';

import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-11 w-11 rounded-[1rem] border border-border/70 bg-card/80 shadow-[0_12px_26px_-18px_rgba(11,27,48,0.45)]',
          className,
        )}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-border/80 bg-card/95 text-foreground shadow-[0_12px_28px_-18px_rgba(11,27,48,0.42)] transition hover:-translate-y-0.5 hover:border-accent/80 hover:text-accent',
        className,
      )}
      aria-label="Toggle theme"
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </button>
  );
}
