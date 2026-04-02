const mongoose = require('mongoose');

const plantationSiteSchema = new mongoose.Schema({
  assignedGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Officer
  areaName: { type: String, required: true },
  areaSize: { type: Number, required: true }, // in hectares or specific unit
  plantationTarget: { type: Number, required: true },
  species: [{ type: String }],
  assignedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Assigned', 'In Progress', 'Completed'], default: 'Assigned' }
}, { timestamps: true });

module.exports = mongoose.model('PlantationSite', plantationSiteSchema);
