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
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group"
  },
  requestedSpecies: [{
    plantTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true
    },
    quantity: { 
      type: Number, 
      required: true,
      min: [1, 'Quantity must be at least 1']
    }
  }],
  purpose: String,
  location: String,
  latitude: Number,
  longitude: Number,
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "PARTIALLY_FULFILLED", "FULFILLED", "REJECTED"],
    default: "PENDING"
  },
  remarks: String
},
{ timestamps: true }
);

plantRequestSchema.index({ organizationId: 1 });
plantRequestSchema.index({ groupId: 1 });

module.exports = mongoose.model("PlantRequest", plantRequestSchema);
