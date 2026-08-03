import { SectionHeading } from '@/components/common/section-heading';
import { getPublicResume } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function ResumePage() {
  const resume = await getPublicResume();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Resume"
        title={resume?.title ?? 'Current Resume'}
        description="The preview and download below stream directly from MongoDB GridFS through the API."
      />
      <div className="mt-10 rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
        <div className="mb-6 flex flex-wrap gap-3">
          {resume?.downloadUrl ? (
            <a
              href={resume.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-5 py-3 text-sm font-semibold text-white"
            >
              Download PDF
            </a>
          ) : null}
        </div>
        {resume?.previewUrl ? (
          <iframe
            title="Resume preview"
            src={resume.previewUrl}
            className="h-[80vh] w-full rounded-[1.5rem] border border-border/60 bg-background"
          />
        ) : (
          <p className="text-sm text-foreground/70">No public resume is available yet.</p>
        )}
      </div>
    </div>
  );
}
