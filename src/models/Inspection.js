const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema(
{
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tree",
    required: true
  },

  inspectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  scheduledDate: {
    type: Date,
    required: true
  },

  completedDate: Date,

  status: {
    type: String,
    enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "MISSED"],
    default: "PENDING"
  },

  // Inspection findings
  treeStatus: {
    type: String,
    enum: ["HEALTHY", "WEAK", "DEAD", "NEEDS_ATTENTION"]
  },

  growthStage: {
    type: String,
    enum: ["SEEDLING", "SAPLING", "YOUNG", "MATURE", "FLOWERING", "FRUITING"]
  },

  healthScore: {
    type: Number,
    min: 1,
    max: 10
  },

  remarks: String,

  // Photo evidence
  photos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Follow-up actions
  recommendedActions: [String],

  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "MEDIUM"
  }
},
{ timestamps: true }
);

// Indexes for efficient queries
inspectionSchema.index({ treeId: 1 });
inspectionSchema.index({ inspectorId: 1 });
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model("Inspection", inspectionSchema);