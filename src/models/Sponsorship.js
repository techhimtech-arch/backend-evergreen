const mongoose = require('mongoose');

const sponsorshipSchema = new mongoose.Schema({
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sponsor',
    required: true
  },
  fundingAmount: {
    type: Number,
    required: true
  },
  plantsCount: {
    type: Number,
    required: true
  },
  dateFunded: {
    type: Date,
    default: Date.now
  },
  allocationDetails: [{
    district: String,
    village: String,
    treesAllocated: Number
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sponsorship', sponsorshipSchema);
