const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorizeBD, authorizeAdmin, authorizeAll } = require('../middleware/auth');

const router = express.Router();

/**
 * Dashboard Routes - All routes require authentication
 */

// GET /dashboard - Get dashboard based on user role
router.get('/', authenticateToken, DashboardController.getDashboard);

// GET /dashboard/bd - BD-specific dashboard (BD role only)
router.get('/bd', authenticateToken, authorizeBD, DashboardController.getBDDashboard);

// GET /dashboard/admin - Admin-specific dashboard (Admin role only)
router.get('/admin', authenticateToken, authorizeAdmin, DashboardController.getAdminDashboard);

module.exports = router;
