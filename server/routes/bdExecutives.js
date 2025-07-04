const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Operator = require('../models/Operator');
const { authenticateToken } = require('../middleware/auth');
const operatorController = require('../controllers/operatorController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/bd-executives - List all BD executives (with assigned operators)
router.get('/', async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  const executives = await User.find({ role: 'BD' });
  res.json({ success: true, data: executives });
});

// POST /api/bd-executives - Create a new BD executive
router.post('/', async (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  req.body.role = 'BD'; // Force role to BD
  next();
}, require('../controllers/authController').register);

// PUT /api/bd-executives/:id - Update a BD executive
router.put('/:id', async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  const { id } = req.params;
  const { name, email, password, contact } = req.body;
  try {
    const update = { name, email, contact };
    if (password) update.password = password;
    const executive = await User.findOneAndUpdate(
      { _id: id, role: 'BD' },
      update,
      { new: true }
    );
    if (!executive) return res.status(404).json({ success: false, message: 'BD Executive not found' });
    res.json({ success: true, executive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating BD Executive', error: error.message });
  }
});

// DELETE /api/bd-executives/:id - Delete a BD executive and unassign their operators
router.delete('/:id', async (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  next();
}, operatorController.deleteBdExecutive);

module.exports = router;
