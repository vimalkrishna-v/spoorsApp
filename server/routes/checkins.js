const express = require('express');
const router = express.Router();
const checkInController = require('../controllers/checkInController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Check-in related routes for BD users
router.post('/can-check-in/:operatorId', checkInController.canCheckIn);
router.post('/check-in/:operatorId', checkInController.checkIn);
router.put('/update-location/:checkInId', checkInController.updateLocation);
router.post('/check-out/:checkInId', checkInController.checkOut);

// Get current active check-in for logged-in BD user
router.get('/active', checkInController.getActiveCheckIn);

// Get check-in history for logged-in BD user
router.get('/history', checkInController.getCheckInHistory);

// Get detailed check-in information (BD users can only access their own, admins can access all)
router.get('/details/:checkInId', checkInController.getCheckInDetails);

// Admin-only routes for check-in management
router.get('/admin/all', requireAdmin, checkInController.getAllCheckIns);
router.get('/admin/analytics', requireAdmin, checkInController.getCheckInAnalytics);
router.get('/admin/details/:checkInId', requireAdmin, checkInController.getCheckInDetailsAdmin);

module.exports = router;
