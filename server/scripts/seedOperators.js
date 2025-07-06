require('dotenv').config();
const mongoose = require('mongoose');
const Operator = require('../models/Operator');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample operators data (subOperators removed)
const operatorsData = [
  {
    name: 'City Bus Lines',
    address: '123 Main St, Downtown, New York, NY 10001',
    contactPerson: 'John Smith',
    phone: '+1-555-0123',
    email: 'john@citybuslines.com',
    status: 'active',
    coordinates: { lat: 12.960345, lng: 77.648861 }
  },
  {
    name: 'Metro Transit',
    address: '456 Park Ave, Uptown, New York, NY 10022',
    contactPerson: 'Emily Davis',
    phone: '+1-555-0456',
    email: 'emily@metrotransit.com',
    status: 'active',
    coordinates: { lat: 13.332691, lng: 74.760635 }
  },
  {
    name: 'Express Routes',
    address: '789 Broadway, Midtown, New York, NY 10003',
    contactPerson: 'Michael Brown',
    phone: '+1-555-0789',
    email: 'michael@expressroutes.com',
    status: 'active',
    coordinates: { lat: 40.7282, lng: -73.9942 }
  },
  {
    name: 'Suburban Lines',
    address: '321 Oak St, Suburban, New York, NY 10456',
    contactPerson: 'Jennifer Wilson',
    phone: '+1-555-0321',
    email: 'jennifer@suburbanlines.com',
    status: 'active',
    coordinates: { lat: 13.332691, lng: 74.760635 }
  },
  {
    name: 'Green Transit',
    address: '654 Pine Ave, Brooklyn, New York, NY 11201',
    contactPerson: 'Thomas Anderson',
    phone: '+1-555-0654',
    email: 'thomas@greentransit.com',
    status: 'active',
    coordinates: { lat: 40.6892, lng: -73.9442 }
  }
];

const seedOperators = async () => {
  try {
    // Clear existing operators
    await Operator.deleteMany({});
    console.log('Cleared existing operators');

    // Find BD users to assign operators to
    const bdUsers = await User.find({ role: 'BD' });
    
    if (bdUsers.length === 0) {
      console.log('No BD users found. Please create BD users first.');
      return;
    }

    console.log(`Found ${bdUsers.length} BD users`);

    // Assign operators to BD users
    const operatorsToSeed = operatorsData.map((operator, index) => ({
      ...operator,
      assignedTo: bdUsers[index % bdUsers.length]._id // Distribute operators among BD users
    }));

    // Insert operators
    const createdOperators = await Operator.insertMany(operatorsToSeed);
    console.log(`Successfully seeded ${createdOperators.length} operators`);

    // Display assignment summary
    const assignmentSummary = {};
    for (const operator of createdOperators) {
      const user = bdUsers.find(u => u._id.toString() === operator.assignedTo.toString());
      if (!assignmentSummary[user.email]) {
        assignmentSummary[user.email] = [];
      }
      assignmentSummary[user.email].push(operator.name);
    }

    console.log('\nOperator assignments:');
    Object.entries(assignmentSummary).forEach(([email, operators]) => {
      console.log(`${email}: ${operators.join(', ')}`);
    });

    console.log('\nSeed completed successfully!');
  } catch (error) {
    console.error('Error seeding operators:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedOperators();
