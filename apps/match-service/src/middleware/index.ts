import type { Request, Response, NextFunction } from 'express';
import { createLogger } from '@khelo/logger';

const logger = createLogger({ service: 'match-service' });

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
}

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  logger.debug(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
  });
  next();
}
