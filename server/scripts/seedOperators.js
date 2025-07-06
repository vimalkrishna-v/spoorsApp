require('dotenv').config();
const mongoose = require('mongoose');
const Operator = require('../models/Operator');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample operators data
const operatorsData = [
  {
    name: 'City Bus Lines',
    address: '123 Main St, Downtown, New York, NY 10001',
    contactPerson: 'John Smith',
    phone: '+1-555-0123',
    email: 'john@citybuslines.com',
    status: 'active',
    coordinates: { lat: 12.960345, lng: 77.648861 },
    subOperators: [
      {
        id: 1,
        name: 'Bus A1',
        type: 'City Bus',
        route: 'Downtown Loop',
        driver: 'Mike Johnson',
        contact: '+1-555-0124',
        status: 'active',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      {
        id: 2,
        name: 'Bus A2',
        type: 'City Bus',
        route: 'Uptown Express',
        driver: 'Sarah Davis',
        contact: '+1-555-0125',
        status: 'active',
        coordinates: { lat: 40.7589, lng: -73.9851 }
      }
    ]
  },
  {
    name: 'Metro Transit',
    address: '456 Park Ave, Uptown, New York, NY 10022',
    contactPerson: 'Emily Davis',
    phone: '+1-555-0456',
    email: 'emily@metrotransit.com',
    status: 'active',
    coordinates: { lat: 13.332691, lng: 74.760635 },
    subOperators: [
      {
        id: 3,
        name: 'Metro M1',
        type: 'Metro Bus',
        route: 'Cross-town',
        driver: 'Alex Wilson',
        contact: '+1-555-0457',
        status: 'active',
    coordinates: { lat: 13.332691, lng: 74.760635 },
      },
      {
        id: 4,
        name: 'Metro M2',
        type: 'Metro Bus',
        route: 'Airport Express',
        driver: 'Lisa Chen',
        contact: '+1-555-0458',
        status: 'maintenance',
    coordinates: { lat: 13.332691, lng: 74.760635 },
      }
    ]
  },
  {
    name: 'Express Routes',
    address: '789 Broadway, Midtown, New York, NY 10003',
    contactPerson: 'Michael Brown',
    phone: '+1-555-0789',
    email: 'michael@expressroutes.com',
    status: 'active',
    coordinates: { lat: 40.7282, lng: -73.9942 },
    subOperators: [
      {
        id: 5,
        name: 'Express E1',
        type: 'Express Bus',
        route: 'Manhattan-Brooklyn',
        driver: 'David Rodriguez',
        contact: '+1-555-0790',
        status: 'active',
        coordinates: { lat: 40.7282, lng: -73.9942 }
      },
      {
        id: 6,
        name: 'Express E2',
        type: 'Express Bus',
        route: 'Queens-Manhattan',
        driver: 'Maria Garcia',
        contact: '+1-555-0791',
        status: 'active',
        coordinates: { lat: 40.7831, lng: -73.8370 }
      }
    ]
  },
  {
    name: 'Suburban Lines',
    address: '321 Oak St, Suburban, New York, NY 10456',
    contactPerson: 'Jennifer Wilson',
    phone: '+1-555-0321',
    email: 'jennifer@suburbanlines.com',
    status: 'active',
    coordinates: { lat: 13.332691, lng: 74.760635 },
    subOperators: [
      {
        id: 7,
        name: 'Suburban S1',
        type: 'Suburban Bus',
        route: 'Bronx Local',
        driver: 'Robert Taylor',
        contact: '+1-555-0322',
        status: 'active',
    coordinates: { lat: 13.332691, lng: 74.760635 },
      },
      {
        id: 8,
        name: 'Suburban S2',
        type: 'Suburban Bus',
        route: 'Westchester Express',
        driver: 'Amanda Lee',
        contact: '+1-555-0323',
        status: 'inactive',
    coordinates: { lat: 13.332691, lng: 74.760635 },
      }
    ]
  },
  {
    name: 'Green Transit',
    address: '654 Pine Ave, Brooklyn, New York, NY 11201',
    contactPerson: 'Thomas Anderson',
    phone: '+1-555-0654',
    email: 'thomas@greentransit.com',
    status: 'active',
    coordinates: { lat: 40.6892, lng: -73.9442 },
    subOperators: [
      {
        id: 9,
        name: 'Green G1',
        type: 'Electric Bus',
        route: 'Brooklyn Heights',
        driver: 'Kevin Park',
        contact: '+1-555-0655',
        status: 'active',
        coordinates: { lat: 40.6892, lng: -73.9442 }
      },
      {
        id: 10,
        name: 'Green G2',
        type: 'Electric Bus',
        route: 'DUMBO Loop',
        driver: 'Nicole Kim',
        contact: '+1-555-0656',
        status: 'active',
        coordinates: { lat: 40.7033, lng: -73.9888 }
      }
    ]
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
