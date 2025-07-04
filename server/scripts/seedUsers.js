require('dotenv').config();
const mongoose = require('mongoose');
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
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');
    
    // Sample users data (BD and Admin)
    const usersData = [
      {
        email: 'bd.user@spoors.com',
        password: 'password123',
        role: 'BD',
        isActive: true
      },
      {
        email: 'john.bd@spoors.com',
        password: 'password123',
        role: 'BD',
        isActive: true
      },
      {
        email: 'dummybd@abc.com',
        password: 'password123',
        role: 'BD',
        isActive: true
      },
      {
        email: 'admin.user@spoors.com',
        password: 'adminpass',
        role: 'Admin',
        isActive: true
      },
      {
        email: 'jane.admin@spoors.com',
        password: 'adminpass',
        role: 'Admin',
        isActive: true
      }
    ];
    
    // Insert users
    for (const userData of usersData) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }
    
    console.log('\n🔐 Note: If you have existing users, their passwords will be automatically hashed on first login');
    console.log('\n🎯 Test the authentication with these endpoints:');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/auth/profile');
    console.log('   GET  /api/dashboard/bd (BD users only)');
    console.log('   GET  /api/dashboard/admin (Admin users only)');
    
    console.log('\nSeeded users successfully!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run the seeding
seedUsers();
