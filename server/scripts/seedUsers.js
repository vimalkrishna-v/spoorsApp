require('dotenv').config();
const database = require('../config/database');
const User = require('../models/User');

/**
 * Seed script to create initial users for testing
 * NOTE: This script is for testing only. If you have existing user data,
 * you should comment out the User.deleteMany({}) line to preserve your data.
 */
const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seeding...');
    
    // Connect to database
    await database.connect();
    
    // WARNING: Comment out the next line if you have existing user data!
    // await User.deleteMany({});
    // console.log('🗑️  Cleared existing users');
    
    // Create sample users (only if they don't exist)
    const users = [
      {
        email: 'bd.user@spoors.com',
        password: 'password123',
        role: 'BD'
      },
      {
        email: 'admin.user@spoors.com',
        password: 'password123',
        role: 'Admin'
      },
      {
        email: 'john.bd@spoors.com',
        password: 'password123',
        role: 'BD'
      },
      {
        email: 'jane.admin@spoors.com',
        password: 'password123',
        role: 'Admin'
      }
    ];
    
    // Insert users only if they don't exist
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${user.email} (${user.role})`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }
    
    console.log('\n🔐 Note: If you have existing users, their passwords will be automatically hashed on first login');
    console.log('\n🎯 Test the authentication with these endpoints:');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/auth/profile');
    console.log('   GET  /api/dashboard/bd (BD users only)');
    console.log('   GET  /api/dashboard/admin (Admin users only)');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

// Run the seeding
seedUsers();
