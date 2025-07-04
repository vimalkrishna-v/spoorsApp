/**
 * Error handling middleware
 */

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    success: false,
    message: 'Internal server error'
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    error.message = 'Validation failed';
    error.errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(error);
  }

  if (err.name === 'CastError') {
    // MongoDB ObjectId casting error
    error.message = 'Invalid ID format';
    return res.status(400).json(error);
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exists`;
    return res.status(409).json(error);
  }

  if (err.name === 'JsonWebTokenError') {
    // JWT error
    error.message = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    // JWT expired error
    error.message = 'Token has expired';
    return res.status(401).json(error);
  }

  // Handle operational errors vs programming errors
  if (err.isOperational) {
    error.message = err.message;
    return res.status(err.statusCode || 500).json(error);
  }

  // Programming errors - don't leak error details
  if (process.env.NODE_ENV === 'development') {
    error.message = err.message;
    error.stack = err.stack;
  }

  res.status(500).json(error);
};

/**
 * Handle 404 routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
