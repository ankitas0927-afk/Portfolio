'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import type { NavigationItem } from '@ankita-portfolio/shared-types';

import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/common/theme-toggle';

export function SiteHeader({
  navigation,
  siteName,
}: {
  navigation: NavigationItem[];
  siteName: string;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] font-display text-lg text-white shadow-soft">
            A
          </span>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-foreground">{siteName}</p>
            <p className="text-xs uppercase tracking-[0.22em] text-foreground/48">Portfolio</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-card text-accent shadow-soft'
                    : 'text-foreground/70 hover:bg-card/70 hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/80 md:hidden"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-border/50 bg-background/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'rounded-2xl px-4 py-3 text-sm font-medium transition',
                  pathname === item.href
                    ? 'bg-card text-accent shadow-soft'
                    : 'text-foreground/74 hover:bg-card/70 hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
