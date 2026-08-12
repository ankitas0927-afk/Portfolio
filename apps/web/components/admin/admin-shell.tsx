'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ADMIN_NAV_ITEMS } from '@ankita-portfolio/config';

import { ThemeToggle } from '@/components/common/theme-toggle';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isHydrating, logout } = useAuth();

  useEffect(() => {
    if (!isHydrating && !admin) {
      router.replace('/admin/login');
    }
  }, [admin, isHydrating, router]);

  if (isHydrating || !admin) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-16">
        <div className="section-card px-6 py-5 text-sm shadow-soft">
          Loading admin session...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
      <aside className="premium-panel shine-sweep p-5 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="premium-pill inline-flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent/82">
              Dashboard
            </div>
            <p className="mt-4 font-display text-2xl font-semibold">Admin</p>
            <p className="text-sm text-foreground/62">{admin.name}</p>
          </div>
          <ThemeToggle />
        </div>
        <nav className="mt-6 grid gap-2">
          <Link
            href="/admin"
            className={cn(
              'rounded-[1.25rem] px-4 py-3 text-sm font-medium transition',
              pathname === '/admin'
                ? 'bg-background text-accent shadow-[0_18px_36px_-28px_rgba(29,78,216,0.85)]'
                : 'text-foreground/72 hover:bg-background/70 hover:text-accent',
            )}
          >
            Overview
          </Link>
          {ADMIN_NAV_ITEMS.filter((item) => item.slug !== 'overview').map((item: (typeof ADMIN_NAV_ITEMS)[number]) => (
            <Link
              key={item.slug}
              href={`/admin/${item.slug}`}
              className={cn(
                'rounded-[1.25rem] px-4 py-3 text-sm font-medium transition',
                pathname === `/admin/${item.slug}`
                  ? 'bg-background text-accent shadow-[0_18px_36px_-28px_rgba(29,78,216,0.85)]'
                  : 'text-foreground/72 hover:bg-background/70 hover:text-accent',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace('/admin/login');
          }}
          className="ghost-button mt-6 w-full"
        >
          Logout
        </button>
      </aside>

      <div className="min-w-0 reveal-up">{children}</div>
    </div>
  );
}
