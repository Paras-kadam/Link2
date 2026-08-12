import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Known operational errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    sendError(res, err.message, 400);
    return;
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    sendError(res, 'Invalid ID format', 400);
    return;
  }

  // Mongoose duplicate key error
  if ('code' in err && (err as Record<string, unknown>)['code'] === 11000) {
    sendError(res, 'Duplicate value — resource already exists', 409);
    return;
  }

  // Unknown errors
  console.error('[error] Unhandled error:', err);

  const message =
    env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error';

  sendError(res, message, 500);
}
