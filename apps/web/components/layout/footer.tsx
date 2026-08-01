import Link from "next/link";
import type { FooterSettingsDto, ProfileDto } from "@ankita-portfolio/shared-types";
import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube
} from "lucide-react";
import { compact } from "@/lib/utils";

const pageLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/education", label: "Education" },
  { href: "/training", label: "Training" },
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" }
] as const;

const socialIconMap = {
  website: Globe,
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  x: Twitter,
  youtube: Youtube
} as const;

type FooterProps = {
  brandName?: string | undefined;
  profile?: ProfileDto | null | undefined;
  footer?: FooterSettingsDto | null | undefined;
};

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

export function Footer({ brandName, profile, footer }: FooterProps) {
  const location = firstNonEmpty(
    footer?.contactLocation,
    profile?.currentLocation,
    compact([profile?.city, profile?.state, profile?.country]).join(", ")
  );
  const email = firstNonEmpty(footer?.contactEmail, profile?.publicProfessionalEmail);
  const phone = firstNonEmpty(footer?.contactPhone, profile?.publicTelephoneNumber);
  const socialEntries = Object.entries(footer?.socialLinks ?? {}).filter(([, value]) => typeof value === "string" && value.trim().length > 0);

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_1fr]">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-aqua">Contact</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink dark:text-white">{brandName || profile?.name || "Ankita Singh"}</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Available for professional opportunities, research work and carefully planned collaborations.
            </p>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {email ? (
                <a className="flex items-center gap-3 transition-colors duration-200 hover:text-aqua" href={`mailto:${email}`}>
                  <Mail className="h-4 w-4 text-aqua" aria-hidden />
                  {email}
                </a>
              ) : null}
              {phone ? (
                <a className="flex items-center gap-3 transition-colors duration-200 hover:text-aqua" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
                  <Phone className="h-4 w-4 text-aqua" aria-hidden />
                  {phone}
                </a>
              ) : null}
              {location ? (
                <p className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-aqua" aria-hidden />
                  {location}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-aqua">Pages</p>
            <nav className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300" aria-label="Footer navigation">
              {pageLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors duration-200 hover:text-aqua">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-aqua">Social</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialEntries.map(([platform, url]) => {
                const Icon = socialIconMap[platform as keyof typeof socialIconMap] || Globe;
                return (
                  <a
                    key={platform}
                    href={String(url)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={platform}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-aqua hover:text-aqua dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>Copyright {new Date().getFullYear()} {brandName || profile?.name || "Ankita Singh"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
