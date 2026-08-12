import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

async function createTestUsers() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[setup] Connected to MongoDB');

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('password123', salt);

    await User.create({
      username: 'user1',
      email: 'user1@link2.private',
      passwordHash,
      displayName: 'User One',
      isActive: true,
    });

    await User.create({
      username: 'user2',
      email: 'user2@link2.private',
      passwordHash,
      displayName: 'User Two',
      isActive: true,
    });

    console.log('[setup] Successfully created user1 and user2');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createTestUsers();
