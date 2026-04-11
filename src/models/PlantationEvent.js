const mongoose = require("mongoose");

const plantationEventSchema = new mongoose.Schema(
{
  // Core relation - links to assignment
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true
  },

  // Event details
  eventName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  eventDate: {
    type: Date,
    required: true
  },

  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },

  // Geo coordinates
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

  // Organization and organizer
  organizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Event details
  organizer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  remarks: {
    type: String,
    maxlength: 1000
  },

  // Status tracking
  status: {
    type: String,
    enum: ["PLANNED", "ONGOING", "COMPLETED", "CANCELLED"],
    default: "PLANNED"
  },

  // Participation tracking
  expectedParticipants: {
    type: Number,
    min: 0
  },
  actualParticipants: {
    type: Number,
    min: 0,
    default: 0
  },

  // Results tracking
  treesPlanted: {
    type: Number,
    min: 0,
    default: 0
  },

  // Photo documentation
  photos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }]
},
{ timestamps: true }
);

// Indexes for efficient queries
plantationEventSchema.index({ assignmentId: 1 });
plantationEventSchema.index({ eventDate: 1 });
plantationEventSchema.index({ status: 1 });
plantationEventSchema.index({ organizedBy: 1 });
plantationEventSchema.index({ latitude: 1, longitude: 1 }); // Geo index

module.exports = mongoose.model("PlantationEvent", plantationEventSchema);
