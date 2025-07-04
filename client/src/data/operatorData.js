// Dummy data for operators and their sub-operators
export const operatorsData = [
  { 
    id: 1, 
    name: 'City Bus Lines', 
    address: '123 Main St, Downtown, New York, NY 10001', 
    lastVisit: '2025-06-15',
    contactPerson: 'John Smith',
    phone: '+1-555-0123',
    email: 'john@citybuslines.com',
    totalBuses: 45,
    activeRoutes: 12,
    status: 'active',
      coordinates: { lat: 12.960346, lng: 77.648861 }
  },
  { 
    id: 2, 
    name: 'Metro Transit', 
    address: '456 Park Ave, Uptown, New York, NY 10022', 
    lastVisit: '2025-06-20',
    contactPerson: 'Sarah Johnson',
    phone: '+1-555-0456',
    email: 'sarah@metrotransit.com',
    totalBuses: 32,
    activeRoutes: 8,
    status: 'active',
    coordinates: { lat: 40.7589, lng: -73.9851 }
  },
  { 
    id: 3, 
    name: 'Express Shuttle', 
    address: '789 Broadway, Midtown, New York, NY 10003', 
    lastVisit: null,
    contactPerson: 'Mike Wilson',
    phone: '+1-555-0789',
    email: 'mike@expressshuttle.com',
    totalBuses: 18,
    activeRoutes: 5,
    status: 'inactive',
    coordinates: { lat: 40.6892, lng: -74.0445 }
  },
  { 
    id: 4, 
    name: 'Rapid Transit Corp', 
    address: '321 Fifth Ave, Manhattan, New York, NY 10016', 
    lastVisit: '2025-07-01',
    contactPerson: 'Emily Davis',
    phone: '+1-555-0321',
    email: 'emily@rapidtransit.com',
    totalBuses: 28,
    activeRoutes: 7,
    status: 'active',
    coordinates: { lat: 40.7505, lng: -73.9934 }
  },
  { 
    id: 5, 
    name: 'Urban Fleet Services', 
    address: '654 Lexington Ave, Upper East Side, New York, NY 10065', 
    lastVisit: '2025-06-28',
    contactPerson: 'Robert Chen',
    phone: '+1-555-0654',
    email: 'robert@urbanfleet.com',
    totalBuses: 22,
    activeRoutes: 6,
    status: 'active',
    coordinates: { lat: 40.7614, lng: -73.9776 }
  }
];

// Sub-operators (buses) data mapped by operator ID
export const subOperatorsData = {
  1: [
    {
      id: 101,
      name: 'Route 1 - Downtown Loop',
      driverName: 'Alex Rodriguez',
      busNumber: 'CB-001',
      currentLocation: 'Main St & 5th Ave',
      passengerCount: 28,
      maxCapacity: 50,
      status: 'On Route',
      lastUpdate: '2025-07-04 10:30:00',
      phone: '+1-555-1001',
      coordinates: { lat: 40.7138, lng: -74.0050 }
    },
    {
      id: 102,
      name: 'Route 2 - City Center',
      driverName: 'Maria Garcia',
      busNumber: 'CB-002',
      currentLocation: 'Central Station',
      passengerCount: 35,
      maxCapacity: 50,
      status: 'At Stop',
      lastUpdate: '2025-07-04 10:28:00',
      phone: '+1-555-1002',
      coordinates: { lat: 40.7118, lng: -74.0070 }
    },
    {
      id: 103,
      name: 'Route 3 - Business District',
      driverName: 'James Chen',
      busNumber: 'CB-003',
      currentLocation: 'Financial Plaza',
      passengerCount: 42,
      maxCapacity: 50,
      status: 'On Route',
      lastUpdate: '2025-07-04 10:32:00',
      phone: '+1-555-1003',
      coordinates: { lat: 40.7108, lng: -74.0080 }
    },
    {
      id: 104,
      name: 'Route 4 - Residential Loop',
      driverName: 'Patricia Wilson',
      busNumber: 'CB-004',
      currentLocation: 'Residential Area Block 12',
      passengerCount: 18,
      maxCapacity: 50,
      status: 'On Route',
      lastUpdate: '2025-07-04 10:35:00',
      phone: '+1-555-1004',
      coordinates: { lat: 40.7148, lng: -74.0040 }
    }
  ],
  2: [
    {
      id: 201,
      name: 'Metro Line A',
      driverName: 'David Park',
      busNumber: 'MT-201',
      currentLocation: 'Uptown Mall',
      passengerCount: 22,
      maxCapacity: 45,
      status: 'On Route',
      lastUpdate: '2025-07-04 10:25:00',
      phone: '+1-555-2001',
      coordinates: { lat: 12.960346, lng: 77.648861 }
      
    },
    {
      id: 202,
      name: 'Metro Line B',
      driverName: 'Lisa Thompson',
      busNumber: 'MT-202',
      currentLocation: 'University Campus',
      passengerCount: 38,
      maxCapacity: 45,
      status: 'On Route',
      lastUpdate: '2025-07-04 10:31:00',
      phone: '+1-555-2002',
      coordinates: { lat: 40.7579, lng: -73.9861 }
    },
    {
      id: 203,
      name: 'Metro Line C',
      driverName: 'Kevin Martinez',
      busNumber: 'MT-203',
      currentLocation: 'Shopping Center',
      passengerCount: 29,
      maxCapacity: 45,
      status: 'At Stop',
      lastUpdate: '2025-07-04 10:29:00',
      phone: '+1-555-2003',
      coordinates: { lat: 40.7569, lng: -73.9871 }
    }
  ],
  3: [
    {
      id: 301,
      name: 'Express Route 1',
      driverName: 'Robert Kim',
      busNumber: 'EX-301',
      currentLocation: 'Broadway Terminal',
      passengerCount: 15,
      maxCapacity: 35,
      status: 'Maintenance',
      lastUpdate: '2025-07-04 09:15:00',
      phone: '+1-555-3001',
      coordinates: { lat: 40.6882, lng: -74.0455 }
    },
    {
      id: 302,
      name: 'Express Route 2',
      driverName: 'Jennifer Lee',
      busNumber: 'EX-302',
      currentLocation: 'Express Terminal',
      passengerCount: 0,
      maxCapacity: 35,
      status: 'Maintenance',
      lastUpdate: '2025-07-04 08:45:00',
      phone: '+1-555-3002',
      coordinates: { lat: 40.6902, lng: -74.0435 }
    }
  ],
  4: [
    {
      id: 401,
      name: 'Rapid Route A',
      driverName: 'Michael Johnson',
      busNumber: 'RT-401',
      currentLocation: 'Fifth Avenue Plaza',
      passengerCount: 31,
      maxCapacity: 40,
      status: 'On Route',
      lastUpdate: '2025-07-04 10:33:00',
      phone: '+1-555-4001',
      coordinates: { lat: 40.7515, lng: -73.9924 }
    },
    {
      id: 402,
      name: 'Rapid Route B',
      driverName: 'Amanda Brown',
      busNumber: 'RT-402',
      currentLocation: 'Empire State Building',
      passengerCount: 25,
      maxCapacity: 40,
      status: 'At Stop',
      lastUpdate: '2025-07-04 10:30:00',
      phone: '+1-555-4002',
      coordinates: { lat: 40.7495, lng: -73.9944 }
    }
  ],
  5: [
    {
      id: 501,
      name: 'Urban Route 1',
      driverName: 'Christopher Davis',
      busNumber: 'UF-501',
      currentLocation: 'Central Park East',
      passengerCount: 33,
      maxCapacity: 38,
      status: 'On Route',
      lastUpdate: '2025-07-04 10:27:00',
      phone: '+1-555-5001',
      coordinates: { lat: 40.7624, lng: -73.9766 }
    },
    {
      id: 502,
      name: 'Urban Route 2',
      driverName: 'Jessica Taylor',
      busNumber: 'UF-502',
      currentLocation: 'Museum District',
      passengerCount: 19,
      maxCapacity: 38,
      status: 'On Route',
      lastUpdate: '2025-07-04 10:34:00',
      phone: '+1-555-5002',
      coordinates: { lat: 40.7604, lng: -73.9786 }
    }
  ]
};

// Helper functions
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'on route':
      return 'success';
    case 'at stop':
      return 'warning';
    case 'maintenance':
      return 'error';
    default:
      return 'default';
  }
};

export const getOperatorStatusColor = (status) => {
  return status === 'active' ? 'success' : 'error';
};

export const getOperatorCoordinates = (operatorId) => {
  const operator = operatorsData.find(op => op.id === operatorId);
  return operator ? operator.coordinates : { lat: 40.7128, lng: -74.0060 };
};

export const getSubOperatorCoordinates = (operatorId, subOperatorId) => {
  const subOps = subOperatorsData[operatorId];
  if (!subOps) return null;
  
  const subOp = subOps.find(sub => sub.id === subOperatorId);
  return subOp ? subOp.coordinates : null;
};

// Mock API functions (for future backend integration)
export const mockApiService = {
  // Get all operators assigned to a BD executive
  getAssignedOperators: async (bdExecutiveId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(operatorsData);
      }, 500);
    });
  },

  // Get sub-operators (buses) for a specific operator
  getSubOperators: async (operatorId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(subOperatorsData[operatorId] || []);
      }, 300);
    });
  },

  // Update operator check-in
  updateCheckIn: async (operatorId, location) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Check-in recorded for operator ${operatorId}`,
          timestamp: new Date().toISOString()
        });
      }, 200);
    });
  },

  // Get real-time bus location updates
  getBusLocations: async (operatorId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const buses = subOperatorsData[operatorId] || [];
        // Simulate slight coordinate changes for real-time effect
        const updatedBuses = buses.map(bus => ({
          ...bus,
          coordinates: {
            lat: bus.coordinates.lat + (Math.random() - 0.5) * 0.0005,
            lng: bus.coordinates.lng + (Math.random() - 0.5) * 0.0005
          },
          lastUpdate: new Date().toISOString()
        }));
        resolve(updatedBuses);
      }, 400);
    });
  }
};
