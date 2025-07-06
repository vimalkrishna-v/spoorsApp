const User = require('../models/User');
const Operator = require('../models/Operator');

// Get all BD users
exports.getAllBDUsers = async (req, res) => {
  try {
    const bdUsers = await User.find({ role: 'BD' }).select('-password');
    res.json({
      success: true,
      data: bdUsers
    });
  } catch (error) {
    console.error('Error fetching BD users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BD users',
      error: error.message
    });
  }
};

// Get all users (for admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Create a new BD user
exports.createBDUser = async (req, res) => {
  try {
    console.log('Create BD User - Request body:', req.body);
    const { email, password, role = 'BD' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    console.log('Create BD User - Existing user check:', existingUser ? 'User exists' : 'User does not exist');
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate required fields
    if (!email || !password) {
      console.log('Create BD User - Validation failed: missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    console.log('Create BD User - Creating new user with email:', email);

    // Create new user
    const newUser = new User({
      email,
      password,
      role
    });

    await newUser.save();
    console.log('Create BD User - User saved successfully:', newUser._id);

    // Remove password from response
    const userResponse = newUser.toJSON();

    res.status(201).json({
      success: true,
      message: 'BD user created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating BD user:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create BD user',
      error: error.message
    });
  }
};

// Update BD user
exports.updateBDUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (email) user.email = email;
    if (password) user.password = password;
    if (typeof isActive !== 'undefined') user.isActive = isActive;

    await user.save();

    const userResponse = user.toJSON();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete BD user
exports.deleteBDUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete BD User - Request for user ID:', id);

    const user = await User.findById(id);
    if (!user) {
      console.log('Delete BD User - User not found:', id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Delete BD User - Found user:', user.email, 'Role:', user.role);

    // Check if user has assigned operators
    const assignedOperators = await Operator.find({ assignedTo: id });
    console.log('Delete BD User - Assigned operators count:', assignedOperators.length);
    
    if (assignedOperators.length > 0) {
      console.log('Delete BD User - Cannot delete user with assigned operators');
      return res.status(400).json({
        success: false,
        message: `Cannot delete user with assigned operators. Please reassign ${assignedOperators.length} operators first.`,
        assignedOperatorsCount: assignedOperators.length,
        assignedOperators: assignedOperators.map(op => ({
          id: op._id,
          name: op.name
        }))
      });
    }

    await User.findByIdAndDelete(id);
    console.log('Delete BD User - User deleted successfully:', id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Assign operators to BD user
exports.assignOperatorsToBD = async (req, res) => {
  try {
    const { bdUserId, operatorIds } = req.body;

    // Validate BD user exists
    const bdUser = await User.findById(bdUserId);
    if (!bdUser || bdUser.role !== 'BD') {
      return res.status(404).json({
        success: false,
        message: 'BD user not found'
      });
    }

    // Update operators
    const result = await Operator.updateMany(
      { _id: { $in: operatorIds } },
      { assignedTo: bdUserId, updatedAt: new Date() }
    );

    res.json({
      success: true,
      message: `Successfully assigned ${result.modifiedCount} operators to BD user`,
      data: {
        assignedCount: result.modifiedCount,
        bdUser: bdUser.toJSON()
      }
    });
  } catch (error) {
    console.error('Error assigning operators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign operators',
      error: error.message
    });
  }
};

// Get operators assigned to a specific BD user
exports.getBDUserOperators = async (req, res) => {
  try {
    const { id } = req.params;

    const operators = await Operator.find({ assignedTo: id })
      .populate('assignedTo', 'email role');

    res.json({
      success: true,
      data: operators
    });
  } catch (error) {
    console.error('Error fetching BD user operators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch operators',
      error: error.message
    });
  }
};
