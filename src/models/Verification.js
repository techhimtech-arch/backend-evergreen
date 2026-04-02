const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  entry: { type: mongoose.Schema.Types.ObjectId, ref: 'PlantationEntry', required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Forest Guard / Verifier
  verificationDate: { type: Date, default: Date.now },
  actualPlantationCount: { type: Number, required: true },
  remarks: { type: String },
  verificationPhotoUrl: { type: String }, // Path or URL to verification photo
  outcome: { type: String, enum: ['Approved', 'Rejected', 'Needs Rework'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Verification', verificationSchema);
