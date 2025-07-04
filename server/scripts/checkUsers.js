require('dotenv').config();
const database = require('../config/database');
const User = require('../models/User');

/**
 * Script to check existing users and their structure
 */
const checkExistingUsers = async () => {
  try {
    console.log('🔍 Checking existing users...');
    
    // Connect to database
    await database.connect();
    
    // Get all users
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('❌ No users found in the database');
      console.log('💡 You may need to check your MONGODB_URI or create some users manually');
    } else {
      console.log(`✅ Found ${users.length} users:`);
      console.log('\n📋 User list:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.email}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Active: ${user.isActive}`);
        console.log(`      Password format: ${user.password.match(/^\$2[aby]\$/) ? 'Hashed' : 'Plain text'}`);
        console.log(`      Created: ${user.createdAt || 'Not set'}`);
        console.log('');
      });
      
      console.log('🔧 Authentication system is now configured to work with your existing data');
      console.log('📝 Notes:');
      console.log('   - Plain text passwords will be automatically hashed on first login');
      console.log('   - Role "Admin" is now supported (previously was "Adm")');
      console.log('   - All users with isActive: true can log in');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
    if (error.name === 'MongoNetworkError') {
      console.log('💡 Make sure MongoDB is running and the connection string is correct');
    }
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

// Run the check
checkExistingUsers();
