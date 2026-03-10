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
  latitude: Number,
  longitude: Number,

  photo: String,

  status: {
    type: String,
    enum: ["PLANTED", "GROWING", "DEAD"],
    default: "PLANTED"
  },

  plantedAt: Date
},
{ timestamps: true }
);

// Index for efficient queries
treeSchema.index({ eventId: 1 });

module.exports = mongoose.model("Tree", treeSchema);
