import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { env } from './src/config/env.js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const updateUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/link2';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);
    
    const users = await User.find();
    
    if (users.length === 2) {
      console.log('Found 2 users. Renaming them to Alex and Sarah...');
      
      const user1 = users[0];
      const user2 = users[1];
      
      user1.displayName = 'Alex';
      user1.username = 'alex';
      user1.email = 'alex@test.com';
      await user1.save();
      
      user2.displayName = 'Sarah';
      user2.username = 'sarah';
      user2.email = 'sarah@test.com';
      await user2.save();
      
      console.log('Successfully renamed users!');
      console.log('User 1:', user1.email, '->', user1.displayName);
      console.log('User 2:', user2.email, '->', user2.displayName);
    } else {
      console.log(`Expected exactly 2 users, but found ${users.length}.`);
    }
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await mongoose.disconnect();
  }
};

updateUsers();
