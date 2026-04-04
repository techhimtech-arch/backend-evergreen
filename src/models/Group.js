const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  groupType: { 
    type: String, 
    enum: ['Mahila Mandal', 'Yuvak Mandal', 'Self Help Group', 'Other'], 
    required: true 
  },
  village: { type: String, required: true },
  panchayat: { type: String, required: true },
  district: { type: String, required: true },
  leaderName: { type: String, required: true },
  mobile: { type: String, required: true },
  membersCount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  isGlobal: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
