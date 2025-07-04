const express = require('express');
const AuthController = require('../controllers/authController');
const { validateLogin, validateRegistration } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Authentication Routes
 */

// POST /auth/login - User login
router.post('/login', validateLogin, AuthController.login);

// POST /auth/register - User registration (for development/admin purposes)
router.post('/register', validateRegistration, AuthController.register);

// POST /auth/logout - User logout
router.post('/logout', authenticateToken, AuthController.logout);

// GET /auth/profile - Get current user profile
router.get('/profile', authenticateToken, AuthController.getProfile);

// GET /auth/verify - Verify token and get user info
router.get('/verify', AuthController.verifyToken);

module.exports = router;
