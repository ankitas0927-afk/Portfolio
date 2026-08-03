import { createServer } from 'http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectToDatabase, disconnectFromDatabase } from './database/mongoose.js';
import { ensureInitialPortfolioData } from './services/bootstrap.service.js';

async function bootstrap() {
  await connectToDatabase();
  try {
    const bootstrapResult = await ensureInitialPortfolioData();
    logger.info(bootstrapResult, 'Application bootstrap check completed');
  } catch (error) {
    logger.error({ error }, 'Application bootstrap check failed');
  }

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'API server listening');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Gracefully shutting down');
    server.close(async () => {
      await disconnectFromDatabase();
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
