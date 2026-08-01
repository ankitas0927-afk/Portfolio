import type { ResumeDto } from "@ankita-portfolio/shared-types";
import { Download, FileText } from "lucide-react";
import { env } from "@/lib/env";
import { mediaDownloadUrl } from "@/lib/media";

function formatBytes(bytes?: number): string {
  if (!bytes || Number.isNaN(bytes)) {
    return "Unknown size";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumePanel({ resume }: { resume: ResumeDto | null }) {
  if (!resume) {
    return (
      <div className="rounded border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        Resume will be available after activation.
      </div>
    );
  }

  const mediaAsset = resume.mediaAsset;
  const isPdf = mediaAsset?.mimeType === "application/pdf";
  const fileName = mediaAsset?.originalName || resume.title;
  const fileType = mediaAsset?.mimeType || "Unknown file type";
  const fileSize = formatBytes(mediaAsset?.size);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <FileText className="h-9 w-9 text-aqua" aria-hidden />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-aqua">Active resume</p>
        <h2 className="mt-3 text-2xl font-semibold text-ink dark:text-white">{resume.title}</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Stored in MongoDB GridFS and streamed from the API.</p>
        <dl className="mt-6 grid gap-3 rounded border border-slate-200 bg-mist p-4 text-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500 dark:text-slate-400">File</dt>
            <dd className="font-medium text-ink dark:text-white">{fileName}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500 dark:text-slate-400">Type</dt>
            <dd className="font-medium text-ink dark:text-white">{fileType}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500 dark:text-slate-400">Size</dt>
            <dd className="font-medium text-ink dark:text-white">{fileSize}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={mediaDownloadUrl(resume.mediaAssetId)}
            className="inline-flex items-center gap-2 rounded bg-aqua px-5 py-3 font-semibold text-white shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-700"
          >
            <Download className="h-5 w-5" aria-hidden />
            Download
          </a>
          {isPdf ? (
            <a
              href={`${env.NEXT_PUBLIC_API_BASE_URL}/resume/preview`}
              className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-5 py-3 font-semibold text-ink transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-aqua hover:text-aqua dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <FileText className="h-5 w-5" aria-hidden />
              Preview PDF
            </a>
          ) : null}
        </div>
        {!isPdf ? (
          <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
            This file is a document format, so the browser preview is disabled. Download it to open it in your document viewer.
          </p>
        ) : null}
      </div>
      <div className="min-h-[70vh] overflow-hidden rounded border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {isPdf ? (
          <object
            aria-label="Resume preview"
            data={`${env.NEXT_PUBLIC_API_BASE_URL}/resume/preview`}
            type="application/pdf"
            className="h-[70vh] w-full"
          >
            <a href={mediaDownloadUrl(resume.mediaAssetId)}>Download resume</a>
          </object>
        ) : (
          <div className="flex h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
            <FileText className="h-14 w-14 text-aqua" aria-hidden />
            <div>
              <p className="text-xl font-semibold text-ink dark:text-white">Preview unavailable for {mediaAsset?.extension?.toUpperCase() || "this format"}</p>
              <p className="mt-2 max-w-md text-slate-600 dark:text-slate-300">
                The document is stored safely in MongoDB and ready to download. PDF files can be previewed inline, while Word documents are served directly.
              </p>
            </div>
            <a
              href={mediaDownloadUrl(resume.mediaAssetId)}
              className="inline-flex items-center gap-2 rounded bg-aqua px-5 py-3 font-semibold text-white shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-700"
            >
              <Download className="h-5 w-5" aria-hidden />
              Download document
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
