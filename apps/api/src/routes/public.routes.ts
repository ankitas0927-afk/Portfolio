import { Router } from 'express';

import { contactSubmissionSchema } from '@ankita-portfolio/validation';
import { asyncHandler } from '../middleware/async-handler';
import { contactRateLimiter } from '../middleware/rate-limit';
import { createContactMessage } from '../services/contact.service';
import {
  getPublicAbout,
  getPublicCertificates,
  getPublicEducation,
  getPublicExperience,
  getPublicHero,
  getPublicInterests,
  getPublicLanguages,
  getPublicNavigation,
  getPublicProfile,
  getPublicProjectBySlug,
  getPublicProjects,
  getPublicResume,
  getPublicSiteContext,
  getPublicSkills,
  getPublicSocialLinks,
  getPublicTraining,
} from '../services/public.service';
import { getMediaAssetById, streamMediaAsset } from '../services/media.service';
import { sendSuccess } from '../utils/http';
import { getClientDetails } from '../utils/misc';

const publicRouter = Router();

publicRouter.get(
  '/site-context',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicSiteContext());
  }),
);

publicRouter.get(
  '/profile',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicProfile());
  }),
);

publicRouter.get(
  '/hero',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicHero());
  }),
);

publicRouter.get(
  '/about',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicAbout());
  }),
);

publicRouter.get(
  '/experience',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicExperience());
  }),
);

publicRouter.get(
  '/education',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicEducation());
  }),
);

publicRouter.get(
  '/training',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicTraining());
  }),
);

publicRouter.get(
  '/skills',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicSkills());
  }),
);

publicRouter.get(
  '/projects',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicProjects());
  }),
);

publicRouter.get(
  '/projects/featured',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicProjects(true));
  }),
);

publicRouter.get(
  '/projects/:slug',
  asyncHandler(async (request, response) => {
    sendSuccess(response, await getPublicProjectBySlug(String(request.params.slug)));
  }),
);

publicRouter.get(
  '/languages',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicLanguages());
  }),
);

publicRouter.get(
  '/interests',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicInterests());
  }),
);

publicRouter.get(
  '/certificates',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicCertificates());
  }),
);

publicRouter.get(
  '/social-links',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicSocialLinks());
  }),
);

publicRouter.get(
  '/navigation',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicNavigation());
  }),
);

publicRouter.get(
  '/resume',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await getPublicResume());
  }),
);

publicRouter.get(
  '/media/:id',
  asyncHandler(async (request, response) => {
    const mediaId = String(request.params.id);
    const asset = await getMediaAssetById(mediaId);
    if (!asset.isPublic) {
      response.status(404).json({
        success: false,
        error: {
          code: 'MEDIA_NOT_FOUND',
          message: 'Media asset not found',
          requestId: request.requestId,
        },
      });
      return;
    }

    await streamMediaAsset({
      request,
      response,
      assetId: mediaId,
      variant: typeof request.query.variant === 'string' ? (request.query.variant as never) : undefined,
      download: request.query.download === '1',
    });
  }),
);

publicRouter.post(
  '/contact',
  contactRateLimiter,
  asyncHandler(async (request, response) => {
    const body = contactSubmissionSchema.parse(request.body);
    const created = await createContactMessage({
      ...body,
      ...getClientDetails(request),
    });
    sendSuccess(response, created, undefined, 201);
  }),
);

export { publicRouter };
