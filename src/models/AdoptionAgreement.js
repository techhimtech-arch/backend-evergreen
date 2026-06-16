const mongoose = require('mongoose');

const adoptionAgreementSchema = new mongoose.Schema({
  agreementNumber: {
    type: String,
    required: true,
    unique: true
  },
  proposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdoptionProposal',
    required: true
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  durationYears: {
    type: Number,
    required: true
  },
  approvedBudget: {
    type: Number,
    required: true
  },
  signedDocument: {
    type: String, // URL to uploaded signed MoU
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'TERMINATED'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

module.exports = mongoose.model('AdoptionAgreement', adoptionAgreementSchema);
