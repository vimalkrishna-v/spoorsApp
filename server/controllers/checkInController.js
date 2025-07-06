const CheckIn = require('../models/CheckIn');
const Operator = require('../models/Operator');
const User = require('../models/User');

// Constants
const ALLOWED_RADIUS_METERS = 400;
const LOCATION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Check if BD user can check in to an operator
exports.canCheckIn = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const { latitude, longitude } = req.body;
    const userId = req.user._id;

    console.log('Can Check In - Request:', { operatorId, userId, latitude, longitude });

    // Validate BD user
    if (req.user.role !== 'BD') {
      return res.status(403).json({
        success: false,
        message: 'Only BD users can check in to operators'
      });
    }

    // Validate operator exists and is assigned to this BD
    const operator = await Operator.findById(operatorId);
    if (!operator) {
      return res.status(404).json({
        success: false,
        message: 'Operator not found'
      });
    }

    if (operator.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this operator'
      });
    }

    // Check if already checked in
    const existingCheckIn = await CheckIn.findOne({
      operatorId,
      userId,
      status: 'checked-in'
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in to this operator',
        checkInId: existingCheckIn._id
      });
    }

    // Calculate distance from operator
    const distance = calculateDistance(
      latitude,
      longitude,
      operator.coordinates.lat,
      operator.coordinates.lng
    );

    const isWithinRadius = distance <= ALLOWED_RADIUS_METERS;

    console.log('Can Check In - Distance check:', { distance, isWithinRadius, allowedRadius: ALLOWED_RADIUS_METERS });

    res.json({
      success: true,
      canCheckIn: isWithinRadius,
      distance: Math.round(distance),
      allowedRadius: ALLOWED_RADIUS_METERS,
      operator: {
        id: operator._id,
        name: operator.name,
        address: operator.address
      }
    });
  } catch (error) {
    console.error('Error checking can check in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate check-in eligibility',
      error: error.message
    });
  }
};

// Check in to an operator
exports.checkIn = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const { latitude, longitude, notes = '' } = req.body;
    const userId = req.user._id;

    console.log('Check In - Request:', { operatorId, userId, latitude, longitude });

    // Validate BD user
    if (req.user.role !== 'BD') {
      return res.status(403).json({
        success: false,
        message: 'Only BD users can check in to operators'
      });
    }

    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    // Validate operator exists and is assigned to this BD
    const operator = await Operator.findById(operatorId);
    if (!operator) {
      return res.status(404).json({
        success: false,
        message: 'Operator not found'
      });
    }

    if (operator.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this operator'
      });
    }

    // Check if already checked in
    const existingCheckIn = await CheckIn.findOne({
      operatorId,
      userId,
      status: 'checked-in'
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in to this operator',
        checkInId: existingCheckIn._id
      });
    }

    // Calculate distance from operator
    const distance = calculateDistance(
      latitude,
      longitude,
      operator.coordinates.lat,
      operator.coordinates.lng
    );

    // Validate location is within allowed radius
    if (distance > ALLOWED_RADIUS_METERS) {
      return res.status(400).json({
        success: false,
        message: `You must be within ${ALLOWED_RADIUS_METERS}m of the operator to check in`,
        distance: Math.round(distance),
        allowedRadius: ALLOWED_RADIUS_METERS
      });
    }

    // Create check-in record
    const checkIn = new CheckIn({
      operatorId,
      userId,
      checkInLocation: {
        latitude,
        longitude,
        distanceFromOperator: Math.round(distance)
      },
      locationTracking: [{
        timestamp: new Date(),
        latitude,
        longitude,
        distanceFromOperator: Math.round(distance),
        isWithinRadius: true
      }],
      notes,
      status: 'checked-in'
    });

    await checkIn.save();

    // Update operator's last visit
    operator.lastVisit = new Date();
    await operator.save();

    console.log('Check In - Success:', checkIn._id);

    res.status(201).json({
      success: true,
      message: 'Successfully checked in',
      data: {
        checkInId: checkIn._id,
        operatorName: operator.name,
        checkInTime: checkIn.checkInTime,
        distance: Math.round(distance)
      }
    });
  } catch (error) {
    console.error('Error during check in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in',
      error: error.message
    });
  }
};

// Update location during check-in (called every 5 minutes)
exports.updateLocation = async (req, res) => {
  try {
    const { checkInId } = req.params;
    const { latitude, longitude } = req.body;
    const userId = req.user._id;

    console.log('🌍 LOCATION UPDATE RECEIVED:', {
      timestamp: new Date().toISOString(),
      checkInId,
      userId: userId.toString(),
      userEmail: req.user.email,
      location: { latitude, longitude },
      source: 'Periodic Location Check (5-minute interval)'
    });

    // Validate required fields
    if (!latitude || !longitude) {
      console.log('❌ Location Update - Missing coordinates');
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    // Find active check-in
    const checkIn = await CheckIn.findOne({
      _id: checkInId,
      userId,
      status: 'checked-in'
    }).populate('operatorId');

    if (!checkIn) {
      console.log('❌ Location Update - No active check-in found for:', { checkInId, userId });
      return res.status(404).json({
        success: false,
        message: 'Active check-in not found'
      });
    }

    // Calculate distance from operator
    const distance = calculateDistance(
      latitude,
      longitude,
      checkIn.operatorId.coordinates.lat,
      checkIn.operatorId.coordinates.lng
    );

    const isWithinRadius = distance <= ALLOWED_RADIUS_METERS;
    const locationTrackingCount = checkIn.locationTracking.length + 1;

    console.log('📍 Location Analysis:', {
      operatorName: checkIn.operatorId.name,
      operatorLocation: checkIn.operatorId.coordinates,
      bdLocation: { latitude, longitude },
      distance: Math.round(distance),
      allowedRadius: ALLOWED_RADIUS_METERS,
      isWithinRadius,
      locationCheckNumber: locationTrackingCount,
      sessionDuration: `${Math.round((new Date() - checkIn.checkInTime) / (1000 * 60))} minutes`
    });

    // Add location tracking entry
    checkIn.locationTracking.push({
      timestamp: new Date(),
      latitude,
      longitude,
      distanceFromOperator: Math.round(distance),
      isWithinRadius
    });

    // Update max distance violated if applicable
    if (!isWithinRadius && (!checkIn.maxDistanceViolated || distance > checkIn.maxDistanceViolated)) {
      checkIn.maxDistanceViolated = Math.round(distance);
    }

    // Auto-checkout if outside radius
    if (!isWithinRadius) {
      checkIn.status = 'auto-checkout';
      checkIn.checkoutReason = 'auto-location-violation';
      checkIn.checkOutTime = new Date();
      checkIn.checkOutLocation = {
        latitude,
        longitude,
        distanceFromOperator: Math.round(distance)
      };

      await checkIn.save();

      console.log('🚨 AUTO-CHECKOUT TRIGGERED:', {
        reason: 'Location violation',
        distance: Math.round(distance),
        allowedRadius: ALLOWED_RADIUS_METERS,
        operatorName: checkIn.operatorId.name,
        bdUser: req.user.email,
        sessionDuration: `${Math.round((checkIn.checkOutTime - checkIn.checkInTime) / (1000 * 60))} minutes`
      });

      return res.json({
        success: true,
        autoCheckout: true,
        message: `Auto-checked out: moved ${Math.round(distance)}m from operator (limit: ${ALLOWED_RADIUS_METERS}m)`,
        distance: Math.round(distance),
        checkOutTime: checkIn.checkOutTime
      });
    }

    await checkIn.save();

    console.log('✅ Location Update - Success:', {
      distance: Math.round(distance),
      isWithinRadius,
      totalLocationChecks: locationTrackingCount,
      operatorName: checkIn.operatorId.name,
      bdUser: req.user.email
    });

    res.json({
      success: true,
      autoCheckout: false,
      distance: Math.round(distance),
      isWithinRadius,
      locationTrackingCount: checkIn.locationTracking.length
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// Manual check out
exports.checkOut = async (req, res) => {
  try {
    const { checkInId } = req.params;
    const { latitude, longitude, notes = '' } = req.body;
    const userId = req.user._id;

    console.log('Check Out - Request:', { checkInId, userId, latitude, longitude });

    // Find active check-in
    const checkIn = await CheckIn.findOne({
      _id: checkInId,
      userId,
      status: 'checked-in'
    }).populate('operatorId');

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: 'Active check-in not found'
      });
    }

    // Calculate distance from operator if location provided
    let distance = null;
    if (latitude && longitude) {
      distance = calculateDistance(
        latitude,
        longitude,
        checkIn.operatorId.coordinates.lat,
        checkIn.operatorId.coordinates.lng
      );

      checkIn.checkOutLocation = {
        latitude,
        longitude,
        distanceFromOperator: Math.round(distance)
      };
    }

    // Update check-in record
    checkIn.status = 'checked-out';
    checkIn.checkoutReason = 'manual';
    checkIn.checkOutTime = new Date();
    if (notes) {
      checkIn.notes = notes;
    }

    await checkIn.save();

    console.log('Check Out - Success:', checkIn._id);

    res.json({
      success: true,
      message: 'Successfully checked out',
      data: {
        checkInId: checkIn._id,
        operatorName: checkIn.operatorId.name,
        checkInTime: checkIn.checkInTime,
        checkOutTime: checkIn.checkOutTime,
        totalDuration: checkIn.totalDuration,
        distance: distance ? Math.round(distance) : null
      }
    });
  } catch (error) {
    console.error('Error during check out:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out',
      error: error.message
    });
  }
};

// Get active check-in for BD user
exports.getActiveCheckIn = async (req, res) => {
  try {
    const userId = req.user._id;

    const activeCheckIn = await CheckIn.findOne({
      userId,
      status: 'checked-in'
    }).populate('operatorId', 'name address coordinates');

    if (!activeCheckIn) {
      return res.json({
        success: true,
        data: null,
        message: 'No active check-in found'
      });
    }

    res.json({
      success: true,
      data: {
        checkInId: activeCheckIn._id,
        operator: activeCheckIn.operatorId,
        checkInTime: activeCheckIn.checkInTime,
        checkInLocation: activeCheckIn.checkInLocation,
        locationTrackingCount: activeCheckIn.locationTracking.length,
        notes: activeCheckIn.notes
      }
    });
  } catch (error) {
    console.error('Error getting active check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active check-in',
      error: error.message
    });
  }
};

// Get check-in history for BD user
exports.getCheckInHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const checkIns = await CheckIn.find({ userId })
      .populate('operatorId', 'name address')
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-locationTracking'); // Exclude detailed location tracking from history

    const total = await CheckIn.countDocuments({ userId });

    res.json({
      success: true,
      data: checkIns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting check-in history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get check-in history',
      error: error.message
    });
  }
};

// Admin functions for check-in management

// Get all check-ins for admin dashboard
exports.getAllCheckIns = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, bdUserId, operatorId, dateFrom, dateTo } = req.query;

    console.log('Admin getAllCheckIns - Request:', {
      page, limit, status, bdUserId, operatorId, dateFrom, dateTo
    });

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (bdUserId) {
      query.userId = bdUserId;
    }
    
    if (operatorId) {
      query.operatorId = operatorId;
    }
    
    if (dateFrom || dateTo) {
      query.checkInTime = {};
      if (dateFrom) {
        query.checkInTime.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.checkInTime.$lte = new Date(dateTo);
      }
    }

    const skip = (page - 1) * limit;

    const checkIns = await CheckIn.find(query)
      .populate('operatorId', 'name address coordinates contactPerson phone')
      .populate('userId', 'email role isActive')
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-locationTracking'); // Exclude detailed tracking for list view

    // Filter out check-ins with null populated fields (deleted references)
    const validCheckIns = checkIns.filter(checkIn => 
      checkIn.operatorId && checkIn.userId
    );

    console.log(`Admin getAllCheckIns - Found ${checkIns.length} total, ${validCheckIns.length} valid check-ins`);

    const total = await CheckIn.countDocuments(query);

    // Calculate summary statistics
    const stats = await CheckIn.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] }
          },
          autoCheckouts: {
            $sum: { $cond: [{ $eq: ['$status', 'auto-checkout'] }, 1, 0] }
          },
          averageDuration: {
            $avg: {
              $cond: [
                { $ne: ['$totalDuration', null] },
                '$totalDuration',
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: validCheckIns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        totalSessions: 0,
        completedSessions: 0,
        autoCheckouts: 0,
        averageDuration: 0
      }
    });
  } catch (error) {
    console.error('Error getting all check-ins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get check-ins',
      error: error.message
    });
  }
};

// Get check-in analytics for admin dashboard
exports.getCheckInAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Daily check-in counts
    const dailyStats = await CheckIn.aggregate([
      {
        $match: {
          checkInTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$checkInTime' }
          },
          totalCheckIns: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] }
          },
          autoCheckouts: {
            $sum: { $cond: [{ $eq: ['$status', 'auto-checkout'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // BD user performance
    const bdPerformance = await CheckIn.aggregate([
      {
        $match: {
          checkInTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] }
          },
          autoCheckouts: {
            $sum: { $cond: [{ $eq: ['$status', 'auto-checkout'] }, 1, 0] }
          },
          averageDuration: {
            $avg: {
              $cond: [
                { $ne: ['$totalDuration', null] },
                '$totalDuration',
                0
              ]
            }
          },
          totalViolations: {
            $sum: {
              $cond: [
                { $ne: ['$maxDistanceViolated', null] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          email: '$user.email',
          totalSessions: 1,
          completedSessions: 1,
          autoCheckouts: 1,
          averageDuration: 1,
          totalViolations: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedSessions', '$totalSessions'] },
              100
            ]
          }
        }
      },
      { $sort: { totalSessions: -1 } }
    ]);

    // Operator visit frequency
    const operatorStats = await CheckIn.aggregate([
      {
        $match: {
          checkInTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$operatorId',
          visitCount: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$userId' },
          lastVisit: { $max: '$checkInTime' }
        }
      },
      {
        $lookup: {
          from: 'operators',
          localField: '_id',
          foreignField: '_id',
          as: 'operator'
        }
      },
      {
        $unwind: {
          path: '$operator',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          name: '$operator.name',
          address: '$operator.address',
          visitCount: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          lastVisit: 1
        }
      },
      { $sort: { visitCount: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        dailyStats,
        bdPerformance,
        operatorStats,
        period: {
          days: parseInt(days),
          startDate,
          endDate: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error getting check-in analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
};

// Get detailed check-in with location tracking (admin version)
exports.getCheckInDetailsAdmin = async (req, res) => {
  try {
    const { checkInId } = req.params;

    const checkIn = await CheckIn.findById(checkInId)
      .populate('operatorId', 'name address coordinates contactPerson phone')
      .populate('userId', 'email role isActive');

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: 'Check-in not found'
      });
    }

    // Add calculated fields for admin view
    const checkInData = checkIn.toObject();
    
    // Calculate session statistics
    if (checkInData.locationTracking && checkInData.locationTracking.length > 0) {
      const validLocations = checkInData.locationTracking.filter(loc => loc.isWithinRadius);
      const violatingLocations = checkInData.locationTracking.filter(loc => !loc.isWithinRadius);
      
      checkInData.sessionStats = {
        totalLocationChecks: checkInData.locationTracking.length,
        validLocationChecks: validLocations.length,
        violatingLocationChecks: violatingLocations.length,
        complianceRate: Math.round((validLocations.length / checkInData.locationTracking.length) * 100),
        firstViolation: violatingLocations.length > 0 ? violatingLocations[0].timestamp : null
      };
    }

    res.json({
      success: true,
      data: checkInData
    });
  } catch (error) {
    console.error('Error getting check-in details for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get check-in details',
      error: error.message
    });
  }
};

// Get detailed check-in information (BD users can only access their own)
exports.getCheckInDetails = async (req, res) => {
  try {
    const { checkInId } = req.params;
    const userId = req.user._id;

    console.log('BD getCheckInDetails - Request:', {
      checkInId,
      userId: userId.toString(),
      userEmail: req.user.email
    });

    // Find check-in and ensure it belongs to the requesting user
    const checkIn = await CheckIn.findOne({
      _id: checkInId,
      userId: userId
    })
    .populate('userId', 'name email')
    .populate('operatorId', 'name location coordinates contactInfo');

    if (!checkIn) {
      console.log('BD getCheckInDetails - Check-in not found for user:', { checkInId, userId });
      return res.status(404).json({
        success: false,
        message: 'Check-in not found or access denied'
      });
    }

    // Calculate session duration
    const endTime = checkIn.checkOutTime || new Date();
    const sessionDuration = Math.round((endTime - checkIn.checkInTime) / (1000 * 60)); // in minutes

    // Calculate compliance metrics
    const totalLocationChecks = checkIn.locationTracking.length;
    const violationChecks = checkIn.locationTracking.filter(track => !track.isWithinRadius).length;
    const complianceRate = totalLocationChecks > 0 ? 
      Math.round(((totalLocationChecks - violationChecks) / totalLocationChecks) * 100) : 100;

    const response = {
      success: true,
      data: {
        checkIn: {
          _id: checkIn._id,
          status: checkIn.status,
          checkInTime: checkIn.checkInTime,
          checkOutTime: checkIn.checkOutTime,
          checkInLocation: checkIn.checkInLocation,
          checkOutLocation: checkIn.checkOutLocation,
          checkInNotes: checkIn.checkInNotes,
          checkOutNotes: checkIn.checkOutNotes,
          checkoutReason: checkIn.checkoutReason,
          maxDistanceViolated: checkIn.maxDistanceViolated
        },
        user: checkIn.userId,
        operator: checkIn.operatorId,
        sessionMetrics: {
          duration: sessionDuration,
          totalLocationChecks,
          violationChecks,
          complianceRate,
          status: checkIn.status
        },
        locationTracking: checkIn.locationTracking
      }
    };

    console.log('BD getCheckInDetails - Success:', {
      checkInId,
      status: checkIn.status,
      duration: sessionDuration,
      complianceRate
    });

    res.json(response);
  } catch (error) {
    console.error('Error getting check-in details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get check-in details',
      error: error.message
    });
  }
};
