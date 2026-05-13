import { PrismaClient } from '../../prisma/client';
import { createLogger } from '@khelo/logger';

const logger = createLogger({ service: 'match-service' });

const databaseUrl = process.env.DATABASE_URL;
logger.info(`Initializing Prisma with schema: ${databaseUrl?.split('schema=')[1] || 'public'}`);

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: ['error', 'warn'],
});

prisma.$connect()
  .then(() => logger.info('Connected to PostgreSQL via Prisma'))
  .catch((err: any) => logger.error('Failed to connect to PostgreSQL', { error: err }));
