import Link from "next/link";
import type { ProfileDto, ResumeDto } from "@ankita-portfolio/shared-types";
import { ArrowRight, Download, Mail } from "lucide-react";
import { MediaImage } from "@/components/common/media-image";
import { MotionReveal } from "@/components/common/motion-reveal";
import { compact } from "@/lib/utils";
import { mediaDownloadUrl } from "@/lib/media";

export function HeroSection({ profile, resume }: { profile: ProfileDto; resume: ResumeDto | null }) {
  const location = profile.currentLocation || compact([profile.city, profile.state, profile.country]).join(", ");

  return (
    <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:min-h-[calc(100vh-4rem)] md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-14 lg:px-8">
        <MotionReveal>
          <p className="mb-4 inline-flex rounded bg-teal-50 px-3 py-1 text-sm font-semibold text-aqua dark:bg-teal-950/60">
            {profile.availabilityStatus}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink dark:text-white sm:text-5xl lg:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-4 text-xl font-medium text-cobalt dark:text-teal-200">{profile.heading}</p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            {profile.heroIntroduction}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {profile.rotatingTitles.map((title) => (
              <span
                key={title}
                className="rounded border border-slate-200 bg-mist px-3 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {title}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded bg-aqua px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-teal-700"
            >
              <Mail className="h-5 w-5" aria-hidden />
              Contact
            </Link>
            {resume ? (
              <a
                href={mediaDownloadUrl(resume.mediaAssetId)}
                className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-5 py-3 font-semibold text-ink transition hover:border-aqua hover:text-aqua dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <Download className="h-5 w-5" aria-hidden />
                Resume
              </a>
            ) : null}
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded px-5 py-3 font-semibold text-slate-700 transition hover:bg-mist dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <ArrowRight className="h-5 w-5" aria-hidden />
              About
            </Link>
          </div>
          {location ? <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">{location}</p> : null}
        </MotionReveal>
        <MotionReveal className="min-h-[360px] overflow-hidden rounded shadow-soft">
          <MediaImage asset={profile.profileImage || profile.heroImage} alt={`${profile.name} profile`} priority />
        </MotionReveal>
      </div>
    </section>
  );
}
