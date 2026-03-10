const mongoose = require("mongoose");

const plantSupplySchema = new mongoose.Schema(
{
  providerId: {
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

  location: String,

  availableFrom: Date,
  availableUntil: Date,

  status: {
    type: String,
    enum: ["AVAILABLE", "RESERVED", "EXHAUSTED"],
    default: "AVAILABLE"
  }
},
{ timestamps: true }
);

// Index for efficient queries
plantSupplySchema.index({ organizationId: 1 });

module.exports = mongoose.model("PlantSupply", plantSupplySchema);
