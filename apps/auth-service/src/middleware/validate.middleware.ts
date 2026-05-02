import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateMiddleware = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};
