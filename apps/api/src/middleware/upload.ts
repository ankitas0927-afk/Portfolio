import multer from 'multer';

import { env } from '../config/env.js';

const globalUploadLimitBytes =
  Math.max(
    env.MAX_PROFILE_IMAGE_MB,
    env.MAX_CONTENT_IMAGE_MB,
    env.MAX_RESUME_MB,
    env.MAX_CERTIFICATE_MB,
    env.MAX_DOCUMENT_MB,
  ) *
  1024 *
  1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: globalUploadLimitBytes,
    files: 1,
  },
});
