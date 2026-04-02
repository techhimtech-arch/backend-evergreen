const mongoose = require('mongoose');

const plantationEntrySchema = new mongoose.Schema({
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'PlantationSite', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Group Leader
  plantationDate: { type: Date, required: true },
  totalPlanted: { type: Number, required: true },
  attendanceCount: { type: Number },
  remarks: { type: String },
  photoUrl: { type: String }, // Path or URL to uploaded photo
  verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('PlantationEntry', plantationEntrySchema);
