const mongoose = require('mongoose');

const adoptionProposalSchema = new mongoose.Schema({
  proposalNumber: {
    type: String,
    required: true,
    unique: true
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForestSite',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  proposalDocument: {
    type: String, // URL to uploaded document
    required: true
  },
  implementationPlan: {
    type: String // Details or URL
  },
  estimatedBudget: {
    type: Number,
    required: true
  },
  maintenancePlan: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  remarks: {
    type: String
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'DRAFT'
  }
}, { timestamps: true });

module.exports = mongoose.model('AdoptionProposal', adoptionProposalSchema);
