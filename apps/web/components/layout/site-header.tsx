'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import type { NavigationItem } from '@ankita-portfolio/shared-types';

import { PortfolioImage } from '@/components/common/portfolio-image';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { cn } from '@/lib/utils';

export function SiteHeader({
  navigation,
  logo,
  siteName,
  siteTagline,
}: {
  navigation: NavigationItem[];
  logo?: { publicUrl: string; altText?: string; width?: number; height?: number } | null;
  siteName: string;
  siteTagline?: string | null;
}) {
  const pathname = usePathname() ?? '/';
  const [isOpen, setIsOpen] = useState(false);

  const isItemActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 lg:px-6">
      <div className="page-shell shine-sweep mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),rgba(45,212,191,0.55),transparent)]" />
        <div className="flex items-center justify-between gap-5">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          {logo?.publicUrl ? (
            <PortfolioImage
              src={logo.publicUrl}
              alt={logo.altText ?? `${siteName} logo`}
              width={logo.width ?? 44}
              height={logo.height ?? 44}
              className="h-12 w-12 rounded-[1.15rem] object-cover shadow-[0_18px_34px_-18px_rgba(29,78,216,0.72)] ring-2 ring-white/80 transition duration-300 group-hover:scale-[1.03] dark:ring-white/10"
              sizes="44px"
            />
          ) : (
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] font-display text-lg text-white shadow-[0_18px_34px_-18px_rgba(29,78,216,0.72)] ring-2 ring-white/80 transition duration-300 group-hover:scale-[1.03] dark:ring-white/10">
              {siteName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-semibold tracking-tight text-sky-700 dark:text-sky-300">
              {siteName}
            </p>
            <p className="truncate text-[11px] uppercase tracking-[0.34em] text-foreground/48">
              {siteTagline?.trim() || 'Portfolio'}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-[1.5rem] border border-border/60 bg-white/70 p-1.5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.45)] backdrop-blur-xl md:flex dark:bg-white/5">
          {navigation.map((item) => {
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                target={item.opensInNewTab ? '_blank' : undefined}
                rel={item.opensInNewTab ? 'noreferrer' : undefined}
                className={cn(
                  'rounded-[1rem] px-4 py-2.5 text-sm font-semibold transition duration-200',
                  isActive
                    ? 'border border-sky-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(234,245,255,0.98))] text-sky-700 shadow-[inset_0_-3px_0_0_rgba(96,165,250,0.92),0_10px_24px_-20px_rgba(29,78,216,0.85)] dark:border-sky-400/20 dark:bg-[linear-gradient(180deg,rgba(20,39,64,0.96),rgba(14,30,49,0.98))] dark:text-sky-200'
                    : 'text-slate-700 hover:-translate-y-0.5 hover:bg-white/82 hover:text-sky-700 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-sky-200',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="rounded-[1.1rem] border-sky-200/90 bg-white/78 text-sky-700 shadow-[0_12px_28px_-18px_rgba(29,78,216,0.7)] hover:border-sky-300 hover:text-sky-800 dark:border-white/10 dark:bg-white/5 dark:text-sky-200 dark:hover:border-sky-300/30 dark:hover:text-white" />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-sky-200/90 bg-white/78 text-sky-700 shadow-[0_12px_28px_-18px_rgba(29,78,216,0.7)] md:hidden dark:border-white/10 dark:bg-white/5 dark:text-sky-200"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      </div>

      {isOpen ? (
        <div className="px-3 pb-3 md:hidden sm:px-4 lg:px-6">
          <div className="page-shell mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <nav className="flex flex-col gap-2 rounded-[1.5rem] border border-border/60 bg-white/76 p-2 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:bg-white/5">
            {navigation.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                target={item.opensInNewTab ? '_blank' : undefined}
                rel={item.opensInNewTab ? 'noreferrer' : undefined}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'rounded-[1.15rem] px-4 py-3 text-sm font-semibold transition',
                  isItemActive(item.href)
                    ? 'border border-sky-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(234,245,255,0.98))] text-sky-700 shadow-[inset_0_-3px_0_0_rgba(96,165,250,0.92)] dark:border-sky-400/20 dark:bg-[linear-gradient(180deg,rgba(20,39,64,0.96),rgba(14,30,49,0.98))] dark:text-sky-200'
                    : 'text-slate-700 hover:bg-sky-50/80 hover:text-sky-700 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-sky-200',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
