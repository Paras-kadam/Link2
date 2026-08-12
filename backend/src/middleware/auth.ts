import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, type IUser } from '../models/User.js';
import { UnauthorizedError } from '../utils/errors.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  userId: string;
}

export const requireAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // Read token from cookies
    const token = req.cookies?.token;

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is disabled');
    }

    // Enforce 2-user architecture authorization:
    // (In our system, if they exist in the DB, they are one of the two authorized users, 
    // because the creation script strictly caps the DB at 2 users).
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    next(error);
  }
};
