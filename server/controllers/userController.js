const User = require('../models/User');

// Get all BD executives (for admin assignment dropdown)
exports.getAllBDs = async (req, res) => {
  try {
    const bds = await User.find({ role: 'BD', isActive: true }, '_id email');
    res.json({ success: true, data: bds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching BD users', error: error.message });
  }
};

// Add a new user (admin only)
exports.addUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!['BD', 'Admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be BD or Admin' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const user = new User({ email, password, role });
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding user', error: error.message });
  }
};
