import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';
import { type LoginUserInput } from '../validators/user.validator.js';
import type { AuthRequest } from '../middleware/auth.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // For local dev with different ports, lax is fine. 'strict' may block initial navigations across ports.
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginUserInput;

    // Find user by email and explicitly select passwordHash
    const user = await User.findOne({ email }).select('+passwordHash');
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is disabled');
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    // Set cookie
    res.cookie('token', token, cookieOptions);

    // Prepare safe user object (removing passwordHash)
    const userObject = user.toJSON();

    // Find partner (the one other user in the db)
    const partner = await User.findOne({ _id: { $ne: user._id } });

    sendSuccess(res, { user: userObject, partner: partner ? partner.toJSON() : null });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('token', { ...cookieOptions, maxAge: 0 });
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.user is guaranteed to exist because this route will use requireAuth middleware
    const user = req.user!;
    
    // Find partner
    const partner = await User.findOne({ _id: { $ne: user._id } });
    
    sendSuccess(res, { user, partner: partner ? partner.toJSON() : null });
  } catch (error) {
    next(error);
  }
};
