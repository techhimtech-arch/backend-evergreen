const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  landArea: { type: Number, required: true },
  targetPlants: { type: Number, required: true },
  species: [{ type: String }],
  assignedDate: { type: Date, default: Date.now },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  
  // Green Adoption fields
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForestSite' },
  agreementId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdoptionAgreement' },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'REJECTED'],
    default: 'PENDING' 
  },
  
  // Progress tracking
  actualPlantsPlanted: { type: Number, default: 0 },
  completionDate: { type: Date },
  
  // Verification workflow
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationDate: { type: Date },
  verificationNotes: { type: String },
  rejectionReason: { type: String },
  
  // Progress updates
  progressUpdates: [{
    date: { type: Date, default: Date.now },
    plantsPlanted: { type: Number },
    notes: { type: String },
    photos: [{ type: String }],
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
