import { SectionHeading } from '@/components/common/section-heading';
import { getTotalExperienceLabel } from '@/lib/experience';
import { canPreviewResumeInline, getResumeDownloadLabel } from '@/lib/media';
import { getPublicExperience, getPublicResume } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function ResumePage() {
  const [resume, experience] = await Promise.all([getPublicResume(), getPublicExperience()]);
  const supportsInlinePreview = canPreviewResumeInline(resume?.media);
  const overallExperienceLabel = getTotalExperienceLabel(experience);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="page-shell px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <SectionHeading
        eyebrow="Resume"
        title={resume?.title ?? 'Current Resume'}
        description="Review the latest resume and download a copy whenever needed."
      />
      <div className="section-card-strong mt-10 px-6 py-6">
        {overallExperienceLabel ? (
          <div className="mb-6 flex flex-wrap gap-3">
            <span className="info-chip">{overallExperienceLabel}</span>
          </div>
        ) : null}
        <div className="mb-6 flex flex-wrap gap-3">
          {resume?.downloadUrl ? (
            <a
              href={resume.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="gradient-button"
            >
              {getResumeDownloadLabel(resume.media)}
            </a>
          ) : null}
          <a href="#resume-preview" className="ghost-button">
            Jump to preview
          </a>
        </div>
        {resume?.previewUrl && supportsInlinePreview ? (
          <iframe
            id="resume-preview"
            title="Resume preview"
            src={resume.previewUrl}
            className="h-[80vh] w-full rounded-[1.75rem] border border-white/15 bg-background/90 shadow-[0_24px_60px_rgba(7,20,36,0.18)]"
          />
        ) : resume?.downloadUrl ? (
          <div id="resume-preview" className="rounded-[1.5rem] border border-dashed border-border/60 bg-background/70 p-8 text-sm leading-8 text-foreground/72">
            This resume is available as a downloadable document and may open best outside the browser preview.
          </div>
        ) : (
          <p className="text-sm text-foreground/70">No public resume is available yet.</p>
        )}
      </div>
      </div>
    </div>
  );
}
