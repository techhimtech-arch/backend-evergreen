const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    admissionNumber: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    dateOfBirth: {
      type: Date,
    },
    parentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    address: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    emergencyContact: {
      type: String,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique admissionNumber per school
studentProfileSchema.index({ admissionNumber: 1, schoolId: 1 }, { unique: true });

// Compound index to ensure unique userId
studentProfileSchema.index({ userId: 1 }, { unique: true });

// Virtual for current enrollment
studentProfileSchema.virtual('currentEnrollment', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'studentId',
  justOne: true,
  match: { status: 'enrolled' }
});

// Static method to get current enrollment
studentProfileSchema.statics.getCurrentEnrollment = async function(studentId, schoolId) {
  const Enrollment = mongoose.model('Enrollment');
  return Enrollment.getCurrentEnrollment(studentId, schoolId);
};

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
