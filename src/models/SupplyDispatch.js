const mongoose = require("mongoose");

const supplyDispatchSchema = new mongoose.Schema(
{
  nurseryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nursery",
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PlantRequest",
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plants: [{
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
  dispatchDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["DISPATCHED", "DELIVERED"],
    default: "DISPATCHED"
  },
  remarks: String
},
{ timestamps: true }
);

supplyDispatchSchema.index({ nurseryId: 1 });
supplyDispatchSchema.index({ requestId: 1 });
supplyDispatchSchema.index({ receiverId: 1 });

module.exports = mongoose.model("SupplyDispatch", supplyDispatchSchema);
