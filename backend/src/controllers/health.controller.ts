import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.js';
import { getDatabaseStatus } from '../config/database.js';

export const checkHealth = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const dbStatus = getDatabaseStatus();
    
    sendSuccess(res, {
      server: 'running',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    next(error);
  }
};
