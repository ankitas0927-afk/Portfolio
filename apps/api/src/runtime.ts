import type { Express } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

import { createApp } from './app';
import { logger } from './config/logger';
import { connectToDatabase, disconnectFromDatabase } from './database/mongoose';
import { ensureInitialPortfolioData } from './services/bootstrap.service';

let cachedAppPromise: Promise<Express> | null = null;

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
  cachedAppPromise ??= initializePortfolioApi();
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
  const app = await getPortfolioApiApp();

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
