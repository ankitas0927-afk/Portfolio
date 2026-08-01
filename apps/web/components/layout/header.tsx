"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import type { ProfileDto } from "@ankita-portfolio/shared-types";
import { gridFsImageLoader, assetAlt } from "@/lib/media";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/education", label: "Education" },
  { href: "/training", label: "Training" },
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" }
] as const;

function initialsFromName(name?: string): string {
  if (!name) {
    return "AS";
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "AS";
}

function BrandMark({ profile }: { profile?: ProfileDto | null | undefined }) {
  const brandAsset = profile?.logo || profile?.profileImage;
  const initials = initialsFromName(profile?.name);

  return (
    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {brandAsset ? (
        <Image
          loader={gridFsImageLoader}
          src={brandAsset.id}
          alt={assetAlt(brandAsset, profile?.name || "Brand mark")}
          width={40}
          height={40}
          sizes="40px"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="grid h-full w-full place-items-center bg-gradient-to-br from-aqua to-cobalt text-xs font-semibold text-white">
          {initials}
        </span>
      )}
    </span>
  );
}

export function Header({ profile }: { profile?: ProfileDto | null }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const brandName = profile?.name || "Ankita Singh";

  const nav = (
    <nav className="flex flex-col gap-2 md:flex-row md:items-center md:gap-1" aria-label="Main navigation">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setOpen(false)}
          className={cn(
            "rounded px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-50 hover:text-aqua dark:text-slate-200 dark:hover:bg-slate-800",
            pathname === link.href && "bg-white text-cobalt shadow-sm dark:bg-slate-800 dark:text-white"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-mist/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold text-ink dark:text-white">
          <BrandMark profile={profile} />
          <span className="truncate">{brandName}</span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {nav}
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md text-slate-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-cobalt dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="hidden h-5 w-5 dark:block" aria-hidden />
            <Moon className="h-5 w-5 dark:hidden" aria-hidden />
          </button>
        </div>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md text-slate-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>
      {open ? <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">{nav}</div> : null}
    </header>
  );
}
