const User = require('../models/User');
const TokenUtils = require('../utils/tokenUtils');

/**
 * Authentication Controllers
 */
class AuthController {
  
  /**
   * User login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findActiveByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      await user.updateLastLogin();

      // Generate access token
      const accessToken = TokenUtils.generateAccessToken(user);

      // Determine redirect URL based on role
      const redirectUrls = {
        'BD': `${process.env.CLIENT_URL}/dashboard/bd`,
        'Admin': `${process.env.CLIENT_URL}/dashboard/admin`
      };

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          accessToken,
          redirectUrl: redirectUrls[user.role],
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  /**
   * User registration (for development/admin purposes)
   */
  static async register(req, res) {
    try {
      const { email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password,
        role
      });

      await user.save();

      // Generate access token
      const accessToken = TokenUtils.generateAccessToken(user);

      // Determine redirect URL based on role
      const redirectUrls = {
        'BD': `${process.env.CLIENT_URL}/dashboard/bd`,
        'Admin': `${process.env.CLIENT_URL}/dashboard/admin`
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          accessToken,
          redirectUrl: redirectUrls[user.role],
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle mongoose validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  /**
   * User logout
   */
  static async logout(req, res) {
    try {
      // In a more advanced implementation, you might want to blacklist the token
      // For now, we'll just send a success response
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      // User is already attached to req by auth middleware
      const user = req.user;

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Verify token and return user info
   */
  static async verifyToken(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = TokenUtils.extractTokenFromHeader(authHeader);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token is required'
        });
      }

      // Verify the token
      const decoded = TokenUtils.verifyToken(token);
      
      // Find the user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Determine redirect URL based on role
      const redirectUrls = {
        'BD': `${process.env.CLIENT_URL}/dashboard/bd`,
        'Admin': `${process.env.CLIENT_URL}/dashboard/admin`
      };

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: user.toJSON(),
          redirectUrl: redirectUrls[user.role],
          tokenExpiration: TokenUtils.getTokenExpirationDate(decoded)
        }
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Token verification failed'
      });
    }
  }
}

module.exports = AuthController;
