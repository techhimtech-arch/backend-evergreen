const mongoose = require("mongoose");

const nurserySchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: [true, 'Nursery name is required'],
    trim: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: [true, 'Organization ID is required']
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'Manager ID is required']
  },
  location: {
    address: { type: String, required: true },
    district: { type: String, required: true },
    latitude: Number,
    longitude: Number
  },
  stock: [{
    plantTypeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Plant",
      required: true
    },
    quantity: { 
      type: Number, 
      default: 0,
      min: [0, 'Stock cannot be negative']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
},
{ timestamps: true }
);

nurserySchema.index({ organizationId: 1 });
nurserySchema.index({ district: 1 });

module.exports = mongoose.model("Nursery", nurserySchema);
