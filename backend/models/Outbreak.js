const mongoose = require('mongoose');

const OutbreakSchema = new mongoose.Schema({
  disease: {
    type: String,
    required: true,
    trim: true
  },
  crop: {
    type: String,
    required: true,
    enum: ['paddy', 'tomato', 'chili'],
    lowercase: true
  },
  confidence: {
    type: Number,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  locationName: {
    type: String,
    default: 'Sri Lanka'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for geo-spatial queries
OutbreakSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Outbreak', OutbreakSchema);
