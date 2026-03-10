const mongoose = require("mongoose");

const plantationEventSchema = new mongoose.Schema(
{
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  },

  title: { type: String, required: true },

  description: String,

  eventDate: Date,

  location: String,
  latitude: Number,
  longitude: Number,

  organizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["PLANNED", "ONGOING", "COMPLETED"],
    default: "PLANNED"
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("PlantationEvent", plantationEventSchema);
