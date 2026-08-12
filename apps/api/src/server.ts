import { createServer } from 'http';

import { env } from './config/env';
import { logger } from './config/logger';
import { disconnectPortfolioApiRuntime, getPortfolioApiApp } from './runtime';

async function bootstrap() {
  const app = await getPortfolioApiApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'API server listening');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Gracefully shutting down');
    server.close(async () => {
      await disconnectPortfolioApiRuntime();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  logger.error({ error }, 'Unable to start API server');
  process.exit(1);
});
