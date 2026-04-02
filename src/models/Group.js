const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Mahila Mandal', 'Yuvak Mandal', 'Self Help Group', 'Other'], 
    required: true 
  },
  village: { type: String, required: true },
  panchayat: { type: String, required: true },
  district: { type: String, required: true },
  leaderName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  totalMembers: { type: Number, required: true, default: 0 },
  leaderUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
