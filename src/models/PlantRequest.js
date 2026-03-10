const mongoose = require("mongoose");

const plantRequestSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },

  plantTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plant",
    required: true
  },

  quantity: { type: Number, required: true },

  purpose: String,

  location: String,
  latitude: Number,
  longitude: Number,

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "FULFILLED"],
    default: "PENDING"
  }
},
{ timestamps: true }
);

// Index for efficient queries
plantRequestSchema.index({ organizationId: 1 });

module.exports = mongoose.model("PlantRequest", plantRequestSchema);
