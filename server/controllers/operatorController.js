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

// Admin: Create a new operator and assign to BD
exports.createOperator = async (req, res) => {
  try {
    const { id, name, latitude, longitude, contact, bdExecutive } = req.body;
    if (!id || !name || !latitude || !longitude || !contact || !bdExecutive) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    // Create operator
    const operator = new Operator({ id, name, latitude, longitude, contact, bdExecutive });
    await operator.save();
    // Add operator id to assignedOperators of BD
    await User.updateOne(
      { $or: [{ _id: bdExecutive }, { name: bdExecutive }] },
      { $addToSet: { assignedOperators: id } }
    );
    res.status(201).json({ success: true, operator });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating operator', error: error.message });
  }
};

// Admin: Update operator and handle reassignment
exports.updateOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, contact, bdExecutive } = req.body;
    const operator = await Operator.findOne({ id });
    if (!operator) return res.status(404).json({ success: false, message: 'Operator not found' });
    const oldBdExecutive = operator.bdExecutive;
    // Update operator fields
    operator.name = name;
    operator.latitude = latitude;
    operator.longitude = longitude;
    operator.contact = contact;
    operator.bdExecutive = bdExecutive;
    await operator.save();
    // If BD changed, update assignedOperators arrays
    if (oldBdExecutive !== bdExecutive) {
      await User.updateOne(
        { $or: [{ _id: oldBdExecutive }, { name: oldBdExecutive }] },
        { $pull: { assignedOperators: id } }
      );
      await User.updateOne(
        { $or: [{ _id: bdExecutive }, { name: bdExecutive }] },
        { $addToSet: { assignedOperators: id } }
      );
    }
    res.json({ success: true, operator });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating operator', error: error.message });
  }
};

// Admin: Delete operator and remove from BD's assignedOperators
exports.deleteOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const operator = await Operator.findOne({ id });
    if (!operator) return res.status(404).json({ success: false, message: 'Operator not found' });
    const bdExecutive = operator.bdExecutive;
    await Operator.deleteOne({ id });
    await User.updateOne(
      { $or: [{ _id: bdExecutive }, { name: bdExecutive }] },
      { $pull: { assignedOperators: id } }
    );
    res.json({ success: true, message: 'Operator deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting operator', error: error.message });
  }
};

// Admin: Delete a BD executive and unassign their operators
exports.deleteBdExecutive = async (req, res) => {
  try {
    const { id } = req.params;
    const bdExecutive = await User.findOne({ _id: id, role: 'BD' });
    if (!bdExecutive) return res.status(404).json({ success: false, message: 'BD Executive not found' });
    // Unassign all operators assigned to this BD
    await Operator.updateMany(
      { bdExecutive: { $in: [id, bdExecutive.name] } },
      { $set: { bdExecutive: null } }
    );
    // Delete the BD executive
    await User.deleteOne({ _id: id });
    res.json({ success: true, message: 'BD Executive deleted and operators unassigned' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting BD Executive', error: error.message });
  }
};
