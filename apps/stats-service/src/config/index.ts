import { getEnvOrDefault } from '@khelo/utils';
import type { ServiceConfig } from '@khelo/types';
import dotenv from 'dotenv';

dotenv.config();

export const config: ServiceConfig = {
  name: 'stats-service',
  port: parseInt(getEnvOrDefault('PORT', '3003'), 10),
  env: (getEnvOrDefault('NODE_ENV', 'development') as ServiceConfig['env']),
  logLevel: (getEnvOrDefault('LOG_LEVEL', 'debug') as ServiceConfig['logLevel']),
  db: {
    host: getEnvOrDefault('DB_HOST', 'localhost'),
    port: parseInt(getEnvOrDefault('DB_PORT', '5432'), 10),
    database: getEnvOrDefault('DB_NAME', 'khelo'),
    username: getEnvOrDefault('DB_USER', 'khelo'),
    password: getEnvOrDefault('DB_PASSWORD', 'khelo_dev'),
    ssl: getEnvOrDefault('NODE_ENV', 'development') === 'production',
  },
  redis: {
    host: getEnvOrDefault('REDIS_HOST', 'localhost'),
    port: parseInt(getEnvOrDefault('REDIS_PORT', '6379'), 10),
  },
};
