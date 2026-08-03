import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { API_PREFIX } from '@ankita-portfolio/config';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler, notFoundMiddleware } from './middleware/error-handler.js';
import { requestContextMiddleware } from './middleware/request-context.js';
import { sanitizeInputMiddleware } from './middleware/sanitize-input.js';
import { adminRouter } from './routes/admin.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { publicRouter } from './routes/public.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(requestContextMiddleware);
  app.use((request, response, next) => {
    const startTime = Date.now();
    response.on('finish', () => {
      if (request.url === '/health' || request.url === `${API_PREFIX}/health`) {
        return;
      }
      logger.info(
        {
          requestId: request.requestId,
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          durationMs: Date.now() - startTime,
        },
        'HTTP request completed',
      );
    });
    next();
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      exposedHeaders: ['x-request-id'],
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(sanitizeInputMiddleware);

  app.use('/health', healthRouter);
  app.use(`${API_PREFIX}/health`, healthRouter);
  app.use(`${API_PREFIX}/auth`, authRouter);
  app.use(`${API_PREFIX}/public`, publicRouter);
  app.use(`${API_PREFIX}/admin`, adminRouter);

  app.use(notFoundMiddleware);
  app.use(errorHandler);

  return app;
}
