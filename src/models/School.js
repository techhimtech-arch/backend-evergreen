const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    subscriptionStatus: { type: String, default: 'trial' },
    subscriptionExpiry: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const School = mongoose.model('School', schoolSchema);

module.exports = School;