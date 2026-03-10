const mongoose = require('mongoose');

const loginAuditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  userTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserType',
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
  },
  action: {
    type: String,
    required: true,
    enum: ['login_success', 'login_failed', 'logout', 'token_refresh', 'password_reset'],
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  success: {
    type: Boolean,
    required: true,
  },
  failureReason: {
    type: String,
    enum: ['invalid_credentials', 'account_deactivated', 'account_locked', 'token_expired', 'invalid_token'],
  },
  sessionId: {
    type: String,
  },
  tokenFamily: {
    type: String,
  },
  location: {
    country: String,
    city: String,
    timezone: String,
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown',
  },
  browser: {
    name: String,
    version: String,
  },
  os: {
    name: String,
    version: String,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
loginAuditSchema.index({ userId: 1, createdAt: -1 });
loginAuditSchema.index({ email: 1, createdAt: -1 });
loginAuditSchema.index({ action: 1, createdAt: -1 });
loginAuditSchema.index({ ipAddress: 1, createdAt: -1 });
loginAuditSchema.index({ success: 1, createdAt: -1 });
loginAuditSchema.index({ schoolId: 1, createdAt: -1 });
loginAuditSchema.index({ userTypeId: 1, createdAt: -1 });

// TTL index - automatically delete documents after 1 year
loginAuditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// Static method to log login attempt
loginAuditSchema.statics.logLoginAttempt = async function(data) {
  const audit = new this(data);
  await audit.save();
  return audit;
};

// Static method to get user login history
loginAuditSchema.statics.getUserLoginHistory = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email');
};

// Static method to get failed login attempts
loginAuditSchema.statics.getFailedLoginAttempts = function(email, timeWindow = 15) {
  const timeWindowMs = timeWindow * 60 * 1000; // Convert minutes to milliseconds
  const cutoffTime = new Date(Date.now() - timeWindowMs);
  
  return this.countDocuments({
    email,
    success: false,
    createdAt: { $gte: cutoffTime }
  });
};

// Static method to get login statistics
loginAuditSchema.statics.getLoginStats = function(schoolId, startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (schoolId) {
    matchStage.schoolId = schoolId;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          action: '$action',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1, '_id.action': 1 } }
  ]);
};

// Static method to detect suspicious activity
loginAuditSchema.statics.detectSuspiciousActivity = function(userId, hours = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.aggregate([
    { $match: { userId, createdAt: { $gte: cutoffTime } } },
    {
      $group: {
        _id: '$ipAddress',
        count: { $sum: 1 },
        uniqueDevices: { $addToSet: '$userAgent' }
      }
    },
    {
      $project: {
        ipAddress: '$_id',
        count: 1,
        uniqueDevicesCount: { $size: '$uniqueDevices' },
        isSuspicious: {
          $or: [
            { $gt: ['$count', 10] }, // More than 10 attempts from same IP
            { $gt: [{ $size: '$uniqueDevices' }, 5] } // More than 5 different devices
          ]
        }
      }
    },
    { $match: { isSuspicious: true } }
  ]);
};

module.exports = mongoose.model('LoginAudit', loginAuditSchema);
