const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
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
    // Keep classId/sectionId for backward compatibility (will be deprecated)
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
    },
    parentName: {
      type: String,
    },
    parentPhone: {
      type: String,
    },
    parentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    address: {
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
studentSchema.index({ admissionNumber: 1, schoolId: 1 }, { unique: true });

// Compound index to ensure unique rollNumber per section per school
studentSchema.index({ rollNumber: 1, sectionId: 1, schoolId: 1 }, { unique: true, sparse: true });

// Virtual for current enrollment
studentSchema.virtual('currentEnrollment', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'studentId',
  justOne: true,
  match: { status: 'enrolled' }
});

// Static method to get current enrollment
studentSchema.statics.getCurrentEnrollment = async function(studentId, schoolId) {
  const Enrollment = mongoose.model('Enrollment');
  return Enrollment.getCurrentEnrollment(studentId, schoolId);
};

module.exports = mongoose.model('Student', studentSchema);