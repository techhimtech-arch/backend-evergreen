const mongoose = require('mongoose');

const forestSiteSchema = new mongoose.Schema({
  siteCode: {
    type: String,
    required: true,
    unique: true
  },
  siteName: {
    type: String,
    required: true
  },
  circle: { type: String },
  division: { type: String },
  range: { type: String },
  block: { type: String },
  beat: { type: String },
  compartment: { type: String },
  district: { type: String },
  village: { type: String },
  areaHectare: {
    type: Number,
    required: true
  },
  latitude: { type: Number },
  longitude: { type: Number },
  geoBoundary: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed // Array of arrays of numbers
    }
  },
  kmlFileUrl: { type: String },
  beforePhotos: [{
    type: String
  }],
  description: { type: String },
  estimatedCost: { type: Number },
  status: {
    type: String,
    enum: ['AVAILABLE', 'UNDER_REVIEW', 'ADOPTED', 'ACTIVE', 'COMPLETED', 'SUSPENDED'],
    default: 'AVAILABLE'
  }
}, { timestamps: true });

// Index for geospatial queries
forestSiteSchema.index({ geoBoundary: '2dsphere' });

module.exports = mongoose.model('ForestSite', forestSiteSchema);
