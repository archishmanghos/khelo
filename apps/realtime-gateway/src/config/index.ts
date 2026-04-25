import { getEnvOrDefault } from '@khelo/utils';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  name: 'realtime-gateway',
  port: parseInt(getEnvOrDefault('PORT', '3004'), 10),
  env: getEnvOrDefault('NODE_ENV', 'development'),
  logLevel: getEnvOrDefault('LOG_LEVEL', 'debug'),
  corsOrigin: getEnvOrDefault('CORS_ORIGIN', 'http://localhost:4200'),
};
