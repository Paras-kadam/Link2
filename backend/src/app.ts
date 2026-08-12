import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';
import { NotFoundError } from './utils/errors.js';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || origin.startsWith('http://localhost:517') || origin === env.FRONTEND_URL) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    })
  );

  // Rate limiting (Basic protection)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  
  // Apply rate limiter to all /api routes
  app.use('/api', limiter);

  // Request parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Logging
  if (env.NODE_ENV !== 'test') {
    // Structured logging for requests
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // API Routes
  app.use('/api', apiRoutes);

  // Handle 404 for undefined routes
  app.use((req, _res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} not found`));
  });

  // Global error handler MUST be the last middleware
  app.use(errorHandler);

  return app;
}
