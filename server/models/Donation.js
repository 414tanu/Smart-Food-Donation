const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['cooked', 'raw', 'packaged'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'servings'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  foodType: {
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'mixed'],
    default: 'vegetarian'
  },
  storageType: {
    type: String,
    enum: ['hot', 'room-temperature', 'refrigerated', 'frozen', 'sealed-packaged'],
    default: 'room-temperature'
  },
  pickupInstructions: {
    type: String,
    trim: true
  },
  safetyChecks: {
    freshPrepared: {
      type: Boolean,
      default: false
    },
    coveredProperly: {
      type: Boolean,
      default: false
    },
    noSpoilage: {
      type: Boolean,
      default: false
    }
  },
  estimatedMeals: {
    type: Number,
    default: 0
  },
  co2SavedKg: {
    type: Number,
    default: 0
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  safePickupWindow: {
    start: {
      type: Date
    },
    end: {
      type: Date
    },
    minutesRemaining: {
      type: Number,
      default: 0
    },
    recommendedWindowMinutes: {
      type: Number,
      default: 0
    }
  },
  criticalAlertSentAt: {
    type: Date
  },
  criticalAlertedNgoIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  imageUrl: {
    type: String,
    // Might be optional if they don't upload a picture
  },
  expiryTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'collected', 'delivered', 'expired'],
    default: 'pending'
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  collectedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
