import type { Express } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

import { createApp } from './app';
import { logger } from './config/logger';
import { connectToDatabase, disconnectFromDatabase } from './database/mongoose';
import { ensureInitialPortfolioData } from './services/bootstrap.service';

let cachedAppPromise: Promise<Express> | null = null;

function createStartupErrorResponse(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
  const isDatabaseConnectionError =
    errorMessage.includes('MongooseServerSelectionError') ||
    errorMessage.includes('MongoServerSelectionError') ||
    errorMessage.includes('SSL routines:ssl3_read_bytes:tlsv1 alert internal error') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('querySrv') ||
    errorMessage.includes('ENOTFOUND');

  if (isDatabaseConnectionError) {
    return {
      statusCode: 503,
      payload: {
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message:
            'The portfolio API cannot connect to MongoDB right now. Check MONGODB_URI and, if you use MongoDB Atlas on Vercel, allow connections from 0.0.0.0/0 in Atlas Network Access.',
        },
      },
    };
  }

  return {
    statusCode: 500,
    payload: {
      success: false,
      error: {
        code: 'API_STARTUP_FAILED',
        message: 'The portfolio API failed to start for this request.',
      },
    },
  };
}

async function initializePortfolioApi() {
  await connectToDatabase();

  try {
    const bootstrapResult = await ensureInitialPortfolioData();
    logger.info(bootstrapResult, 'Application bootstrap check completed');
  } catch (error) {
    logger.error({ error }, 'Application bootstrap check failed');
  }

  return createApp();
}

export function getPortfolioApiApp() {
  cachedAppPromise ??= initializePortfolioApi().catch((error) => {
    cachedAppPromise = null;
    throw error;
  });
  return cachedAppPromise;
}

export async function disconnectPortfolioApiRuntime() {
  cachedAppPromise = null;
  await disconnectFromDatabase();
}

export async function handleNextApiRequest(
  request: IncomingMessage,
  response: ServerResponse,
) {
  let app: Express;
  try {
    app = await getPortfolioApiApp();
  } catch (error) {
    logger.error({ error }, 'Unable to initialize API runtime');

    if (!response.headersSent) {
      const startupError = createStartupErrorResponse(error);
      response.statusCode = startupError.statusCode;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.end(JSON.stringify(startupError.payload));
      return;
    }

    throw error;
  }

  await new Promise<void>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      response.off('finish', handleComplete);
      response.off('close', handleComplete);
      response.off('error', handleError);
    };

    const settle = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      callback();
    };

    const handleComplete = () => {
      settle(resolve);
    };

    const handleError = (error: Error) => {
      settle(() => reject(error));
    };

    response.on('finish', handleComplete);
    response.on('close', handleComplete);
    response.on('error', handleError);

    try {
      app(request as never, response as never, (error?: unknown) => {
        if (error instanceof Error) {
          handleError(error);
          return;
        }

        if (error) {
          handleError(new Error('Unhandled Express middleware error'));
          return;
        }

        if (!response.writableEnded) {
          handleComplete();
        }
      });
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error('Unhandled Express application error'),
      );
    }
  });
}
