const express = require('express');
const router = express.Router();
const operatorController = require('../controllers/operatorController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes
// GET /api/operators - Get all operators assigned to the BD user
router.get('/', operatorController.getAssignedOperators);

// GET /api/operators/:operatorId - Get specific operator details
router.get('/:operatorId', operatorController.getOperatorById);

// POST /api/operators/:operatorId/checkin - Check in to an operator
router.post('/:operatorId/checkin', operatorController.checkIn);

// POST /api/operators/:operatorId/checkout - Check out from an operator
router.post('/:operatorId/checkout', operatorController.checkOut);

// GET /api/operators/checkins/history - Get check-in history for the BD user
router.get('/checkins/history', operatorController.getCheckInHistory);

// GET /api/operators/checkins/status - Get current check-in status for all operators
router.get('/checkins/status', operatorController.getCheckInStatus);

// PUT /api/operators/:operatorId - Update operator information (admin only)
router.put('/:operatorId', (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
}, operatorController.updateOperator);

module.exports = router;
