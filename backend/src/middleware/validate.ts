import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * On validation failure, returns a 400 JSON error with details.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        sendError(res, `Validation failed — ${message}`, 400);
        return;
      }
      next(error);
    }
  };
}
