import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ForbiddenError } from '../utils/errors';
import { Role } from '../../prisma/client';

export const roleMiddleware = (roles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('User not authenticated'));
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};
