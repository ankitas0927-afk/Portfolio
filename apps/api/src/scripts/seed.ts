import { connectToDatabase, disconnectFromDatabase } from '../database/mongoose';
import { logger } from '../config/logger';
import { ensureInitialPortfolioData } from '../services/bootstrap.service';

async function main() {
  await connectToDatabase();
  const result = await ensureInitialPortfolioData();
  logger.info(result, 'Seed script completed');
}

main()
  .then(async () => {
    await disconnectFromDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error({ error }, 'Seed script failed');
    await disconnectFromDatabase();
    process.exit(1);
  });
