const mongoose = require("mongoose");

const treeSchema = new mongoose.Schema(
{
  plantTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plant"
  },

  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PlantationEvent"
  },

  plantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  location: String,
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

  // Enhanced health tracking for Phase 2
  status: {
    type: String,
    enum: ["PLANTED", "GROWING", "HEALTHY", "WEAK", "DEAD"],
    default: "PLANTED"
  },

  growthStage: {
    type: String,
    enum: ["SEEDLING", "SAPLING", "YOUNG", "MATURE", "FLOWERING", "FRUITING"],
    default: "SEEDLING"
  },

  healthRemarks: String,

  // Photo management
  photos: [{
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    caption: String
  }],

  // Inspection tracking
  lastInspectionDate: Date,
  nextInspectionDate: Date,

  plantedAt: Date
},
{ timestamps: true }
);

// Index for efficient queries
treeSchema.index({ eventId: 1 });
treeSchema.index({ status: 1 });
treeSchema.index({ latitude: 1, longitude: 1 }); // Geo index

module.exports = mongoose.model("Tree", treeSchema);
