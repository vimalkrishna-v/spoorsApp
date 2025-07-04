const mongoose = require('mongoose');

// Main operator schema
const operatorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: String,
    required: true,
    trim: true
  },
  longitude: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  bdExecutive: {
    type: String, // user id or name
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
operatorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Operator = mongoose.model('Operator', operatorSchema);

module.exports = Operator;
