const jwt = require('jsonwebtoken');

/**
 * JWT utility functions
 */
class TokenUtils {
  
  /**
   * Generate JWT token for user
   * @param {Object} payload - User payload to encode
   * @returns {string} JWT token
   */
  static generateToken(payload) {
    try {
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { 
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          issuer: 'spoors-app',
          audience: 'spoors-app-users'
        }
      );
      return token;
    } catch (error) {
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate access token for authenticated user
   * @param {Object} user - User object
   * @returns {string} JWT access token
   */
  static generateAccessToken(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      type: 'access'
    };
    return this.generateToken(payload);
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'spoors-app',
        audience: 'spoors-app-users'
      });
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Extracted token or null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Check if token is expired
   * @param {Object} decodedToken - Decoded JWT token
   * @returns {boolean} True if token is expired
   */
  static isTokenExpired(decodedToken) {
    if (!decodedToken.exp) return true;
    return Date.now() >= decodedToken.exp * 1000;
  }

  /**
   * Get token expiration date
   * @param {Object} decodedToken - Decoded JWT token
   * @returns {Date|null} Expiration date or null
   */
  static getTokenExpirationDate(decodedToken) {
    if (!decodedToken.exp) return null;
    return new Date(decodedToken.exp * 1000);
  }
}

module.exports = TokenUtils;
