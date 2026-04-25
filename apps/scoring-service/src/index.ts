import app from './app';
import { config } from './config';
import { createLogger } from '@khelo/logger';

const logger = createLogger({ service: config.name, level: config.logLevel });

const server = app.listen(config.port, () => {
  logger.info(`🏏 ${config.name} running on port ${config.port} [${config.env}]`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => { logger.error('Forced shutdown'); process.exit(1); }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
