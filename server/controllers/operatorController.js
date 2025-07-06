const Operator = require('../models/Operator');
const CheckIn = require('../models/CheckIn');
const User = require('../models/User');

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Get all operators assigned to a BD user
exports.getAssignedOperators = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    
    const operators = await Operator.find({ assignedTo: userId })
      .populate('assignedTo', 'email role')
      .sort({ createdAt: -1 });

    // Get recent check-ins for each operator
    const operatorsWithCheckIns = await Promise.all(
      operators.map(async (operator) => {
        const recentCheckIn = await CheckIn.findOne({
          operatorId: operator._id,
          userId: userId,
          status: 'checked-in'
        }).sort({ checkInTime: -1 });

        return {
          ...operator.toObject(),
          currentlyCheckedIn: !!recentCheckIn,
          lastCheckIn: recentCheckIn ? recentCheckIn.checkInTime : null
        };
      })
    );

    res.json({
      success: true,
      data: operatorsWithCheckIns
    });
  } catch (error) {
    console.error('Error fetching assigned operators:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned operators',
      error: error.message
    });
  }
};

// Get operator details by ID
exports.getOperatorById = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const userId = req.user._id;

    const operator = await Operator.findOne({
      _id: operatorId,
      assignedTo: userId
    }).populate('assignedTo', 'email role');

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: 'Operator not found or not assigned to you'
      });
    }

    // Get check-in history for this operator
    const checkInHistory = await CheckIn.find({
      operatorId: operatorId,
      userId: userId
    }).sort({ checkInTime: -1 }).limit(10);

    res.json({
      success: true,
      data: {
        ...operator.toObject(),
        checkInHistory
      }
    });
  } catch (error) {
    console.error('Error fetching operator details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching operator details',
      error: error.message
    });
  }
};

// Check in to an operator
exports.checkIn = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const userId = req.user._id;
    const { location } = req.body;

    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location data is required for check-in'
      });
    }

    // Find the operator
    const operator = await Operator.findOne({
      _id: operatorId,
      assignedTo: userId
    });

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: 'Operator not found or not assigned to you'
      });
    }

    // Check if user is within 100 meters of operator location
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      operator.coordinates.lat,
      operator.coordinates.lng
    );

    if (distance > 100) {
      return res.status(400).json({
        success: false,
        message: 'You must be within 100 meters of the operator location to check in',
        distance: Math.round(distance)
      });
    }

    // Check if already checked in
    const existingCheckIn = await CheckIn.findOne({
      operatorId: operatorId,
      userId: userId,
      status: 'checked-in'
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'You are already checked in to this operator'
      });
    }

    // Create new check-in record
    const checkIn = new CheckIn({
      operatorId: operatorId,
      userId: userId,
      checkInTime: new Date(),
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      status: 'checked-in'
    });

    await checkIn.save();

    // Update operator's last visit
    operator.lastVisit = new Date();
    await operator.save();

    res.json({
      success: true,
      message: 'Check-in successful',
      data: {
        checkInId: checkIn._id,
        checkInTime: checkIn.checkInTime,
        operator: operator.name
      }
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-in',
      error: error.message
    });
  }
};

// Check out from an operator
exports.checkOut = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const { userId } = req.user;
    const { location, notes } = req.body;

    // Find the active check-in
    const checkIn = await CheckIn.findOne({
      operatorId: operatorId,
      userId: userId,
      status: 'checked-in'
    });

    if (!checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No active check-in found for this operator'
      });
    }

    // Update check-in record
    checkIn.checkOutTime = new Date();
    checkIn.status = 'checked-out';
    checkIn.notes = notes || '';
    
    if (location) {
      checkIn.checkOutLocation = {
        latitude: location.latitude,
        longitude: location.longitude
      };
    }

    await checkIn.save();

    res.json({
      success: true,
      message: 'Check-out successful',
      data: {
        checkInId: checkIn._id,
        checkInTime: checkIn.checkInTime,
        checkOutTime: checkIn.checkOutTime,
        duration: Math.round((checkIn.checkOutTime - checkIn.checkInTime) / 1000 / 60) // minutes
      }
    });
  } catch (error) {
    console.error('Error during check-out:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-out',
      error: error.message
    });
  }
};

// Get check-in history for a BD user
exports.getCheckInHistory = async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    const checkIns = await CheckIn.find({ userId })
      .populate('operatorId', 'name address')
      .sort({ checkInTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CheckIn.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        checkIns,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching check-in history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching check-in history',
      error: error.message
    });
  }
};

// Get current check-in status for all operators
exports.getCheckInStatus = async (req, res) => {
  try {
    const { userId } = req.user;

    const activeCheckIns = await CheckIn.find({
      userId: userId,
      status: 'checked-in'
    }).populate('operatorId', 'name');

    const checkInStatus = {};
    activeCheckIns.forEach(checkIn => {
      checkInStatus[checkIn.operatorId._id] = {
        status: 'checked-in',
        checkInTime: checkIn.checkInTime,
        operatorName: checkIn.operatorId.name
      };
    });

    res.json({
      success: true,
      data: checkInStatus
    });
  } catch (error) {
    console.error('Error fetching check-in status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching check-in status',
      error: error.message
    });
  }
};

// Update operator information (for admin use)
exports.updateOperator = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const operator = await Operator.findByIdAndUpdate(
      operatorId,
      updates,
      { new: true, runValidators: true }
    );

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: 'Operator not found'
      });
    }

    res.json({
      success: true,
      message: 'Operator updated successfully',
      data: operator
    });
  } catch (error) {
    console.error('Error updating operator:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating operator',
      error: error.message
    });
  }
};

// Get all operators (for admin)
exports.getAllOperators = async (req, res) => {
  try {
    const operators = await Operator.find({})
      .populate('assignedTo', 'email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: operators
    });
  } catch (error) {
    console.error('Error fetching all operators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch operators',
      error: error.message
    });
  }
};

// Create new operator (for admin)
exports.createOperator = async (req, res) => {
  try {
    const { name, address, contactPerson, phone, email, coordinates, assignedTo } = req.body;

    // Validate required fields
    if (!name || !address || !contactPerson || !phone || !email || !coordinates || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if assigned user exists and is BD role
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser || assignedUser.role !== 'BD') {
      return res.status(400).json({
        success: false,
        message: 'Assigned user must be a BD role user'
      });
    }

    const newOperator = new Operator({
      name,
      address,
      contactPerson,
      phone,
      email,
      coordinates,
      assignedTo
    });

    await newOperator.save();
    await newOperator.populate('assignedTo', 'email role');

    res.status(201).json({
      success: true,
      message: 'Operator created successfully',
      data: newOperator
    });
  } catch (error) {
    console.error('Error creating operator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create operator',
      error: error.message
    });
  }
};

// Delete operator (for admin)
exports.deleteOperator = async (req, res) => {
  try {
    const { operatorId } = req.params;

    const operator = await Operator.findById(operatorId);
    if (!operator) {
      return res.status(404).json({
        success: false,
        message: 'Operator not found'
      });
    }

    // Delete associated check-ins
    await CheckIn.deleteMany({ operatorId: operatorId });

    // Delete the operator
    await Operator.findByIdAndDelete(operatorId);

    res.json({
      success: true,
      message: 'Operator deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting operator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete operator',
      error: error.message
    });
  }
};
