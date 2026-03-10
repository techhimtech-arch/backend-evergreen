const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });
userRoleSchema.index({ userId: 1, isActive: 1 });
userRoleSchema.index({ roleId: 1, isActive: 1 });
userRoleSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to find active roles for user
userRoleSchema.statics.findActiveRolesForUser = function(userId) {
  return this.find({ 
    userId, 
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).populate('roleId');
};

// Static method to assign role to user
userRoleSchema.statics.assignRoleToUser = function(userId, roleId, assignedBy, expiresAt = null) {
  return this.create({
    userId,
    roleId,
    assignedBy,
    expiresAt
  });
};

// Static method to remove role from user
userRoleSchema.statics.removeRoleFromUser = function(userId, roleId) {
  return this.updateOne(
    { userId, roleId, isActive: true },
    { isActive: false }
  );
};

module.exports = mongoose.model('UserRole', userRoleSchema);
