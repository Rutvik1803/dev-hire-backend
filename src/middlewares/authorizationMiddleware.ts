import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { ForbiddenError } from '../utils/customErrors';
import { Role } from '@prisma/client';

/**
 * Middleware to check if user has required role(s)
 * Must be used after authenticate middleware
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw ForbiddenError('Authentication required');
      }

      // Check if user's role is in allowed roles
      const userRole = req.user.role as Role;

      if (!allowedRoles.includes(userRole)) {
        throw ForbiddenError('You do not have permission to perform this action');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware specifically for recruiter-only routes
 */
export const requireRecruiter = authorize(Role.RECRUITER);

/**
 * Middleware specifically for developer-only routes
 */
export const requireDeveloper = authorize(Role.DEVELOPER);

/**
 * Middleware specifically for admin-only routes
 */
export const requireAdmin = authorize(Role.ADMIN);

/**
 * Middleware for routes accessible by developers and admins
 */
export const requireDeveloperOrAdmin = authorize(Role.DEVELOPER, Role.ADMIN);
