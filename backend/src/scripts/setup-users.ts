import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import readline from 'readline/promises';

async function setupUser() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[setup] Connected to MongoDB');

    // 1. Enforce Two-User Limit
    const userCount = await User.countDocuments();
    if (userCount >= 2) {
      console.error('[setup] ERROR: The application already has exactly two authorized users.');
      console.error('[setup] Further registration is strictly prohibited by the private 2-user architecture.');
      process.exit(1);
    }

    console.log(`[setup] Current authorized users: ${userCount}/2`);

    // 2. Gather user info
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const username = await rl.question('Enter Username: ');
    const email = await rl.question('Enter Email: ');
    const displayName = await rl.question('Enter Display Name: ');
    
    // Hide password input
    console.log('Enter Password: ');
    const password = await rl.question(''); // In a real terminal, we might use a hidden prompt package, but this works for basic CLI.
    
    rl.close();

    if (!username || !email || !password || !displayName) {
      console.error('[setup] ERROR: All fields are required.');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('[setup] ERROR: Password must be at least 8 characters long.');
      process.exit(1);
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create User
    const newUser = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      isActive: true,
    });

    await newUser.save();
    console.log(`\n[setup] SUCCESS: Authorized User created successfully.`);
    console.log(`[setup] Total authorized users now: ${userCount + 1}/2`);

    process.exit(0);
  } catch (error) {
    console.error('[setup] FATAL ERROR:', error);
    process.exit(1);
  }
}

setupUser();
