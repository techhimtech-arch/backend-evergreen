const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Ensure related models are registered
require('./UserType');
require('./Role');

const userSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4()
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 6
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    profileImage: {
      type: String,
      trim: true
    },
    userTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserType',
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'SUSPENDED', 'DELETED'],
      default: 'ACTIVE'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    lastLoginAt: {
      type: Date
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    },
    emailVerificationToken: {
      type: String
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.passwordHash;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        return ret;
      }
    }
  }
);

// Indexes for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ userTypeId: 1 });
userSchema.index({ status: 1 });
userSchema.index({ uuid: 1 });
userSchema.index({ schoolId: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Instance method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Static method to find by email with user type and roles
userSchema.statics.findByEmailWithRoles = function(email) {
  return this.findOne({ email, status: 'ACTIVE' })
    .populate('userTypeId')
    .populate({
      path: 'roles',
      populate: {
        path: 'roleId',
        model: 'Role'
      }
    });
};

// Static method to find active users by user type
userSchema.statics.findActiveByUserType = function(userTypeName) {
  return this.find({ status: 'ACTIVE' })
    .populate({
      path: 'userTypeId',
      match: { name: userTypeName }
    })
    .populate({
      path: 'roles',
      populate: {
        path: 'roleId',
        model: 'Role'
      }
    });
};

// Static method to find active users by role
userSchema.statics.findActiveByRole = function(roleName) {
  return this.find({ status: 'ACTIVE' })
    .populate('userTypeId')
    .populate({
      path: 'roles',
      populate: {
        path: 'roleId',
        match: { name: roleName, isActive: true }
      }
    });
};

// Virtual for roles
userSchema.virtual('roles', {
  ref: 'UserRole',
  localField: '_id',
  foreignField: 'userId'
});

const User = mongoose.model('User', userSchema);

module.exports = User;