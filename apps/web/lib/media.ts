import type { MediaCategory, MediaReference } from '@ankita-portfolio/shared-types';

export const resumeFileAccept =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const imageFileAccept = '.jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif';
const iconFileAccept = '.ico,image/x-icon';

export function canPreviewResumeInline(media?: MediaReference | null) {
  if (!media) {
    return false;
  }

  return media.mimeType === 'application/pdf' || media.extension?.toLowerCase() === 'pdf';
}

export function getResumeDownloadLabel(media?: MediaReference | null) {
  const extension = media?.extension?.trim().toUpperCase();
  return extension ? `Download ${extension}` : 'Download Resume';
}

export function getAcceptedFileTypes(category: MediaCategory | string) {
  switch (category) {
    case 'resume':
    case 'document':
    case 'certificate-pdf':
      return resumeFileAccept;
    case 'favicon':
    case 'logo':
      return `${imageFileAccept},${iconFileAccept}`;
    default:
      return imageFileAccept;
  }
}
