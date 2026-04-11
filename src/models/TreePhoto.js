const mongoose = require("mongoose");

const treePhotoSchema = new mongoose.Schema(
{
  // Core relation
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tree",
    required: true
  },

  // Photo details
  photoUrl: {
    type: String,
    required: true,
    trim: true
  },

  // Photo classification
  type: {
    type: String,
    enum: ["PLANTATION", "INSPECTION", "FOLLOWUP", "MONITORING", "OTHER"],
    required: true
  },

  // Upload metadata
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  uploadedAt: {
    type: Date,
    default: Date.now
  },

  // Photo description
  caption: {
    type: String,
    maxlength: 500
  },

  // Additional details
  remarks: {
    type: String,
    maxlength: 1000
  },

  // Photo metadata
  fileName: String,
  fileSize: Number, // in bytes
  mimeType: String,
  dimensions: {
    width: Number,
    height: Number
  },

  // Location data (if available)
  latitude: {
    type: Number,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180
  },

  // Quality and verification
  quality: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "MEDIUM"
  },

  verified: {
    type: Boolean,
    default: false
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  verifiedAt: Date,

  // Status
  status: {
    type: String,
    enum: ["ACTIVE", "HIDDEN", "DELETED"],
    default: "ACTIVE"
  },

  // Tags for categorization
  tags: [String],

  // Related inspection or monitoring record
  relatedInspectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inspection"
  },

  relatedMonitoringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TreeMonitoring"
  }
},
{ timestamps: true }
);

// Indexes for efficient queries
treePhotoSchema.index({ treeId: 1 });
treePhotoSchema.index({ type: 1 });
treePhotoSchema.index({ uploadedBy: 1 });
treePhotoSchema.index({ uploadedAt: -1 });
treePhotoSchema.index({ status: 1 });
treePhotoSchema.index({ verified: 1 });

// Compound indexes for common queries
treePhotoSchema.index({ treeId: 1, uploadedAt: -1 });
treePhotoSchema.index({ treeId: 1, type: 1 });
treePhotoSchema.index({ status: 1, verified: 1 });

module.exports = mongoose.model("TreePhoto", treePhotoSchema);
