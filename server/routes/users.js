const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Test route for debugging authentication
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication test successful',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Routes for admin only
router.get('/bd-users', requireAdmin, userController.getAllBDUsers);
router.get('/all', requireAdmin, userController.getAllUsers);
router.post('/bd-users', requireAdmin, userController.createBDUser);
router.put('/bd-users/:id', requireAdmin, userController.updateBDUser);
router.delete('/bd-users/:id', requireAdmin, userController.deleteBDUser);
router.post('/assign-operators', requireAdmin, userController.assignOperatorsToBD);
router.get('/bd-users/:id/operators', requireAdmin, userController.getBDUserOperators);

module.exports = router;
