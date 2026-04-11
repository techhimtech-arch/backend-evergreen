const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema(
{
  // Core relation
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tree",
    required: true
  },

  // Assignment details
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },

  completedDate: Date,

  // Status tracking
  status: {
    type: String,
    enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "MISSED", "CANCELLED"],
    default: "PENDING"
  },

  // Inspection findings
  healthScore: {
    type: Number,
    min: 1,
    max: 10
  },

  treeStatus: {
    type: String,
    enum: ["HEALTHY", "WEAK", "DEAD", "NEEDS_ATTENTION"]
  },

  growthStage: {
    type: String,
    enum: ["SEEDLING", "SAPLING", "YOUNG", "MATURE"]
  },

  // Measurements
  height: {
    type: Number,
    min: 0
  },
  heightUnit: {
    type: String,
    enum: ["cm", "ft", "m"],
    default: "ft"
  },

  // Observations
  remarks: {
    type: String,
    maxlength: 1000
  },

  // Photo evidence
  photo: {
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },

  // Follow-up actions
  recommendedActions: [String],

  // Priority and urgency
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "MEDIUM"
  },

  // Additional metadata
  weatherCondition: {
    type: String,
    enum: ["SUNNY", "CLOUDY", "RAINY", "SNOWY", "UNKNOWN"],
    default: "UNKNOWN"
  },

  inspectionDuration: Number, // in minutes
  travelDistance: Number, // in km

  // Follow-up scheduling
  nextInspectionDate: Date,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDetails: String,

  // Quality control
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  verificationDate: Date,
  verificationNotes: String
},
{ timestamps: true }
);

// Indexes for efficient queries
inspectionSchema.index({ treeId: 1 });
inspectionSchema.index({ assignedTo: 1 });
inspectionSchema.index({ assignedBy: 1 });
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ scheduledDate: 1 });
inspectionSchema.index({ completedDate: 1 });
inspectionSchema.index({ priority: 1 });
inspectionSchema.index({ nextInspectionDate: 1 });

// Compound indexes for common queries
inspectionSchema.index({ assignedTo: 1, status: 1 });
inspectionSchema.index({ treeId: 1, scheduledDate: -1 });
inspectionSchema.index({ status: 1, priority: 1 });
inspectionSchema.index({ scheduledDate: 1, status: 1 });

module.exports = mongoose.model("Inspection", inspectionSchema);