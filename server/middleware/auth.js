/**
 * Authentication middleware for JWT-based authentication
 */

const TokenUtils = require('../utils/tokenUtils');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Request to:', req.method, req.originalUrl);
    console.log('Auth middleware - Auth header:', authHeader ? `Bearer ${authHeader.split(' ')[1]?.substring(0, 20)}...` : 'Missing');
    
    const token = TokenUtils.extractTokenFromHeader(authHeader);
    
    if (!token) {
      console.log('Auth middleware - No token found');
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify the token
    const decoded = TokenUtils.verifyToken(token);
    console.log('Auth middleware - Token decoded for user:', decoded.email, 'role:', decoded.role);
    
    // Check if token is for access
    if (decoded.type !== 'access') {
      console.log('Auth middleware - Invalid token type:', decoded.type);
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find the user and ensure they're still active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      console.log('Auth middleware - User not found or inactive:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    console.log('Auth middleware - Authentication successful for:', user.email);
    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error.message);
    return res.status(401).json({
      success: false,
      message: error.message || 'Token verification failed'
    });
  }
};

/**
 * Middleware to authorize specific roles
 * @param {Array} allowedRoles - Array of allowed roles
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Middleware for BD role authorization
 */
const authorizeBD = authorizeRoles(['BD']);

/**
 * Middleware for Admin role authorization
 */
const authorizeAdmin = authorizeRoles(['Admin']);

/**
 * Convenience middleware for requiring admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

/**
 * Middleware for both BD and Admin roles
 */
const authorizeAll = authorizeRoles(['BD', 'Admin']);

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeBD,
  authorizeAdmin,
  requireAdmin,
  authorizeAll
};
