const mongoose = require("mongoose");

const treeSchema = new mongoose.Schema(
{
  // Human-readable unique tree ID
  treeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },

  // Core relations
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true
  },

  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PlantationEvent",
    required: true
  },

  speciesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plant",
    required: true
  },

  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },

  plantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  plantedDate: {
    type: Date,
    required: true,
    default: Date.now
  },

  // Geo location
  location: {
    type: String,
    trim: true,
    maxlength: 500
  },
  latitude: {
    type: Number,
    min: -90,
    max: 90,
    required: true
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180,
    required: true
  },

  // Tree status and health
  status: {
    type: String,
    enum: ["PLANTED", "GROWING", "HEALTHY", "WEAK", "DEAD"],
    default: "PLANTED"
  },

  growthStage: {
    type: String,
    enum: ["SEEDLING", "SAPLING", "YOUNG", "MATURE"],
    default: "SEEDLING"
  },

  // Additional details
  remarks: {
    type: String,
    maxlength: 1000
  },

  // Photo management (main plantation photo)
  photo: {
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    caption: String
  },

  // Inspection tracking
  lastInspectionDate: Date,
  nextInspectionDate: Date,

  // Accountability tracking
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  verificationDate: Date,
  verificationStatus: {
    type: String,
    enum: ["PENDING", "VERIFIED", "REJECTED"],
    default: "PENDING"
  }
},
{ timestamps: true }
);

// Indexes for efficient queries
treeSchema.index({ treeId: 1 }, { unique: true });
treeSchema.index({ assignmentId: 1 });
treeSchema.index({ eventId: 1 });
treeSchema.index({ groupId: 1 });
treeSchema.index({ speciesId: 1 });
treeSchema.index({ plantedBy: 1 });
treeSchema.index({ status: 1 });
treeSchema.index({ growthStage: 1 });
treeSchema.index({ latitude: 1, longitude: 1 }); // Geo index
treeSchema.index({ plantedDate: 1 });
treeSchema.index({ verificationStatus: 1 });

// Compound indexes for common queries
treeSchema.index({ assignmentId: 1, status: 1 });
treeSchema.index({ groupId: 1, status: 1 });
treeSchema.index({ eventId: 1, plantedBy: 1 });

module.exports = mongoose.model("Tree", treeSchema);
