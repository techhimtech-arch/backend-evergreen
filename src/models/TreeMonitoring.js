const mongoose = require("mongoose");

const treeMonitoringSchema = new mongoose.Schema(
{
  // Core relation
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tree",
    required: true
  },

  // Monitoring details
  inspectionDate: {
    type: Date,
    required: true,
    default: Date.now
  },

  // Growth tracking
  growthStage: {
    type: String,
    enum: ["SEEDLING", "SAPLING", "YOUNG", "MATURE"],
    required: true
  },

  height: {
    type: Number,
    min: 0,
    required: true
  },
  heightUnit: {
    type: String,
    enum: ["cm", "ft", "m"],
    default: "ft"
  },

  // Health status
  status: {
    type: String,
    enum: ["PLANTED", "GROWING", "HEALTHY", "WEAK", "DEAD"],
    required: true
  },

  healthScore: {
    type: Number,
    min: 1,
    max: 10
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

  // Monitoring metadata
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Environmental conditions
  weatherCondition: {
    type: String,
    enum: ["SUNNY", "CLOUDY", "RAINY", "SNOWY", "UNKNOWN"],
    default: "UNKNOWN"
  },

  soilCondition: {
    type: String,
    enum: ["DRY", "MOIST", "WET", "UNKNOWN"],
    default: "UNKNOWN"
  },

  // Water and care information
  lastWateredDate: Date,
  fertilizationApplied: {
    type: Boolean,
    default: false
  },
  fertilizationType: String,

  // Pest and disease tracking
  pestObserved: {
    type: Boolean,
    default: false
  },
  pestDetails: String,
  diseaseObserved: {
    type: Boolean,
    default: false
  },
  diseaseDetails: String,

  // Growth measurements
  trunkDiameter: Number, // in cm
  canopySpread: Number, // in ft

  // Recommendations
  recommendations: [String],
  nextActionDate: Date,
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "MEDIUM"
  }
},
{ timestamps: true }
);

// Indexes for efficient queries
treeMonitoringSchema.index({ treeId: 1 });
treeMonitoringSchema.index({ inspectionDate: -1 });
treeMonitoringSchema.index({ status: 1 });
treeMonitoringSchema.index({ growthStage: 1 });
treeMonitoringSchema.index({ updatedBy: 1 });
treeMonitoringSchema.index({ nextActionDate: 1 });

// Compound indexes for common queries
treeMonitoringSchema.index({ treeId: 1, inspectionDate: -1 });
treeMonitoringSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model("TreeMonitoring", treeMonitoringSchema);
