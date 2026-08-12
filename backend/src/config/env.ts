import dotenv from 'dotenv';
import path from 'node:path';

// Load .env from backend root
dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env') });

interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  MONGODB_URI: string;
  FRONTEND_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

function loadEnv(): EnvConfig {
  const requiredVars = ['MONGODB_URI'] as const;
  const missing: string[] = [];

  for (const key of requiredVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Copy backend/.env.example to backend/.env and fill in the values.`
    );
  }

  return {
    PORT: parseInt(process.env['PORT'] || '5000', 10),
    NODE_ENV: (process.env['NODE_ENV'] as EnvConfig['NODE_ENV']) || 'development',
    MONGODB_URI: process.env['MONGODB_URI']!,
    FRONTEND_URL: process.env['FRONTEND_URL'] || 'http://localhost:5173',
    JWT_SECRET: process.env['JWT_SECRET'] || 'dev-placeholder-change-in-production',
    JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '7d',
  };
}

export const env = loadEnv();
