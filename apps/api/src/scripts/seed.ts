import { connectToDatabase, disconnectFromDatabase } from '../database/mongoose.js';
import { logger } from '../config/logger.js';
import { ensureInitialPortfolioData } from '../services/bootstrap.service.js';

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
