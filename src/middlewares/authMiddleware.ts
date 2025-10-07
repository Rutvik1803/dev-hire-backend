import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { UnauthorizedError } from '../utils/customErrors';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

/**
 * Middleware to verify JWT access token
 * Adds user data to request object if valid
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw UnauthorizedError('Access token required');
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw UnauthorizedError('Access token required');
    }

    // Verify token
    const decoded = verifyToken(token, 'access');

    if (!decoded) {
      throw UnauthorizedError('Invalid or expired access token');
    }

    // Add user data to request
    req.user = decoded as { userId: number; role: string };

    next();
  } catch (error) {
    next(error);
  }
};
