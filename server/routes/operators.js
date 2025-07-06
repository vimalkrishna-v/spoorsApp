const express = require('express');
const router = express.Router();
const operatorController = require('../controllers/operatorController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Admin-only routes
router.get('/admin/all', requireAdmin, operatorController.getAllOperators);
router.post('/admin/create', requireAdmin, operatorController.createOperator);
router.delete('/admin/:operatorId', requireAdmin, operatorController.deleteOperator);
router.put('/admin/:operatorId', requireAdmin, operatorController.updateOperator);

// BD User routes
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

module.exports = router;
