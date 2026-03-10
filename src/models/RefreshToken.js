const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: false, // Make optional for superadmin users
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
    },
    revokedReason: {
      type: String,
      enum: ['logout', 'token_rotation', 'security', 'admin_action'],
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    // Token family for rotation detection
    family: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ family: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to find valid token
refreshTokenSchema.statics.findValidToken = async function (token) {
  return this.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
};

// Instance method to revoke token
refreshTokenSchema.methods.revoke = async function (reason = 'logout') {
  this.isRevoked = true;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

// Static method to revoke all tokens in a family (for rotation theft detection)
refreshTokenSchema.statics.revokeFamily = async function (family, reason = 'security') {
  return this.updateMany(
    { family, isRevoked: false },
    {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    }
  );
};

// Static method to revoke all user tokens
refreshTokenSchema.statics.revokeAllUserTokens = async function (userId, reason = 'security') {
  return this.updateMany(
    { userId, isRevoked: false },
    {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    }
  );
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
