const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get all BD executives (admin only)
router.get('/bd', authenticateToken, authorizeAdmin, userController.getAllBDs);

// Add a new user (admin only)
router.post('/', authenticateToken, authorizeAdmin, userController.addUser);

module.exports = router;
