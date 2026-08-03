import { Router } from 'express';

import { changePasswordSchema, loginSchema } from '@ankita-portfolio/validation';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rate-limit.js';
import {
  authenticateAdmin,
  changeAdminPassword,
  getAuthenticatedAdmin,
  getRefreshCookieOptions,
  listAdminSessions,
  logoutAdmin,
  logoutAllSessions,
  REFRESH_COOKIE_NAME,
  refreshAdminSession,
  revokeAdminSession,
} from '../services/auth.service.js';
import { sendSuccess } from '../utils/http.js';
import { getClientDetails } from '../utils/misc.js';

const authRouter = Router();

authRouter.post(
  '/login',
  authRateLimiter,
  asyncHandler(async (request, response) => {
    const body = loginSchema.parse(request.body);
    const session = await authenticateAdmin(body.email, body.password, {
      ...getClientDetails(request),
      requestId: request.requestId,
    });

    response.cookie(REFRESH_COOKIE_NAME, session.refreshToken, getRefreshCookieOptions());
    sendSuccess(
      response,
      {
        admin: session.admin,
        accessToken: session.accessToken,
      },
      undefined,
      200,
    );
  }),
);

authRouter.post(
  '/refresh',
  asyncHandler(async (request, response) => {
    const rawRefreshToken = request.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!rawRefreshToken) {
      response.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
      response.status(401).json({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required',
          requestId: request.requestId,
        },
      });
      return;
    }

    const refreshedSession = await refreshAdminSession(rawRefreshToken, {
      ...getClientDetails(request),
      requestId: request.requestId,
    });

    response.cookie(REFRESH_COOKIE_NAME, refreshedSession.refreshToken, getRefreshCookieOptions());
    sendSuccess(response, {
      admin: refreshedSession.admin,
      accessToken: refreshedSession.accessToken,
    });
  }),
);

authRouter.post(
  '/logout',
  asyncHandler(async (request, response) => {
    await logoutAdmin(request.cookies?.[REFRESH_COOKIE_NAME] as string | undefined, {
      ...getClientDetails(request),
      requestId: request.requestId,
    });
    response.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
    sendSuccess(response, { loggedOut: true });
  }),
);

authRouter.post(
  '/logout-all',
  requireAuth,
  asyncHandler(async (request, response) => {
    await logoutAllSessions(request.auth!.adminId, request.requestId);
    response.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
    sendSuccess(response, { loggedOut: true });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (request, response) => {
    const admin = await getAuthenticatedAdmin(request.auth!.adminId);
    sendSuccess(response, admin);
  }),
);

authRouter.get(
  '/sessions',
  requireAuth,
  asyncHandler(async (request, response) => {
    const sessions = await listAdminSessions(request.auth!.adminId);
    sendSuccess(response, sessions);
  }),
);

authRouter.delete(
  '/sessions/:id',
  requireAuth,
  asyncHandler(async (request, response) => {
    await revokeAdminSession(request.auth!.adminId, String(request.params.id), request.requestId);
    sendSuccess(response, { revoked: true });
  }),
);

authRouter.patch(
  '/change-password',
  requireAuth,
  asyncHandler(async (request, response) => {
    const body = changePasswordSchema.parse(request.body);
    await changeAdminPassword(
      request.auth!.adminId,
      body.currentPassword,
      body.newPassword,
      request.requestId,
    );
    response.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
    sendSuccess(response, { passwordChanged: true });
  }),
);

export { authRouter };
