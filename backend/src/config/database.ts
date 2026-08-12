import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(`[database] Connected to MongoDB`);
  } catch (error) {
    console.error('[database] MongoDB connection failed:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('[database] MongoDB runtime error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[database] MongoDB disconnected');
  });
}

export function getDatabaseStatus(): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
}
