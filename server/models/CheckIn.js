const mongoose = require('mongoose');

const locationTrackingSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  distanceFromOperator: {
    type: Number, // in meters
    required: true
  },
  isWithinRadius: {
    type: Boolean,
    required: true
  }
}, { _id: false });

const checkInSchema = new mongoose.Schema({
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Operator',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  checkInLocation: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    distanceFromOperator: {
      type: Number, // in meters
      required: true
    }
  },
  checkOutLocation: {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    distanceFromOperator: {
      type: Number, // in meters
      default: null
    }
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out', 'auto-checkout'],
    default: 'checked-in'
  },
  checkoutReason: {
    type: String,
    enum: ['manual', 'auto-location-violation', 'auto-timeout'],
    default: null
  },
  locationTracking: [locationTrackingSchema],
  totalDuration: {
    type: Number, // in minutes
    default: null
  },
  maxDistanceViolated: {
    type: Number, // maximum distance from operator during session
    default: null
  },
  notes: {
    type: String,
    default: ''
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
checkInSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate total duration if checked out
  if (this.checkOutTime && this.checkInTime) {
    this.totalDuration = Math.round((this.checkOutTime - this.checkInTime) / (1000 * 60)); // in minutes
  }
  
  next();
});

// Static method to calculate distance between two coordinates (Haversine formula)
checkInSchema.statics.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Instance method to check if location is within radius
checkInSchema.methods.isLocationWithinRadius = function(lat, lng, operatorLat, operatorLng, radiusMeters = 400) {
  const distance = this.constructor.calculateDistance(lat, lng, operatorLat, operatorLng);
  return {
    isWithin: distance <= radiusMeters,
    distance: Math.round(distance)
  };
};

// Create indexes for better performance
checkInSchema.index({ operatorId: 1, userId: 1 });
checkInSchema.index({ checkInTime: -1 });
checkInSchema.index({ status: 1 });
checkInSchema.index({ userId: 1, status: 1 });
checkInSchema.index({ 'locationTracking.timestamp': -1 });

module.exports = mongoose.model('CheckIn', checkInSchema);
