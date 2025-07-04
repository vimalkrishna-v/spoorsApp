const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['BD', 'Admin'],
      message: 'Role must be either BD (Business Development) or Admin (Administrator)'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  contact: {
    type: String,
    required: [true, 'Contact is required'],
    trim: true
  },
  assignedOperators: {
    type: [String],
    default: [],
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (this.password.match(/^\$2[aby]\$/)) {
      return next(); // Password is already hashed, skip hashing
    }

    // Hash password with cost of 12
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Check if stored password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (this.password.match(/^\$2[aby]\$/)) {
      // Password is hashed, use bcrypt compare
      return await bcrypt.compare(candidatePassword, this.password);
    } else {
      // Password is plain text (existing data), compare directly and then hash it
      if (candidatePassword === this.password) {
        // Password matches, hash it for future use
        this.password = candidatePassword; // This will trigger the pre-save hook to hash it
        await this.save();
        return true;
      }
      return false;
    }
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// Static method to find active user by email
userSchema.statics.findActiveByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

// Transform output to exclude password
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
