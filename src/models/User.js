const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Ensure Role model is registered
require('./Role');

const userSchema = new mongoose.Schema(
  {
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
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    },
    emailVerified: {
      type: Boolean,
      default: false
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
userSchema.index({ roleId: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ schoolId: 1 });

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

// Static method to find by email with role
userSchema.statics.findByEmailWithRole = function(email) {
  return this.findOne({ email, isActive: true }).populate('roleId');
};

// Static method to find active users by role
userSchema.statics.findActiveByRole = function(roleName) {
  return this.find({ isActive: true })
    .populate({
      path: 'roleId',
      match: { name: roleName, isActive: true }
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;