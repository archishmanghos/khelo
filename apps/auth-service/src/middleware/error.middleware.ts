import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { createLogger } from '@khelo/logger';

const logger = createLogger({ service: 'auth-service', level: 'debug' });

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  logger.error('Unhandled Error:', err);

  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
