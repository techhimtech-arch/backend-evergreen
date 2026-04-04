const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  landArea: { type: Number, required: true },
  targetPlants: { type: Number, required: true },
  species: [{ type: String }],
  assignedDate: { type: Date, default: Date.now },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
