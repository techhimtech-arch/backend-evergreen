const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
{
  name: { type: String, required: true },

  description: String,

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  },

  isActive: { type: Boolean, default: true }
},
{ timestamps: true }
);

// Index for efficient queries
roleSchema.index({ organizationId: 1 });

module.exports = mongoose.model("Role", roleSchema);
