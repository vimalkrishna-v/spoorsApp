const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const operatorRoutes = require('./operators');
const userRoutes = require('./users');
const dashboardRoutes = require('./dashboard');
const checkInRoutes = require('./checkins');

// Sample route
router.get('/', (req, res) => {
  res.json({
    message: 'API is working',
    version: '1.0.0'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/operators', operatorRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/checkins', checkInRoutes);

module.exports = router;
