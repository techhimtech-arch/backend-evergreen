const mongoose = require('mongoose');

const studentFeeSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    // Keep studentId for backward compatibility
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    balanceAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Updated indexes for enrollment-based queries
studentFeeSchema.index({ enrollmentId: 1, academicYearId: 1, schoolId: 1 }, { unique: true });
studentFeeSchema.index({ studentId: 1, academicYearId: 1, schoolId: 1 }, { unique: true, sparse: true }); // Legacy support

module.exports = mongoose.model('StudentFee', studentFeeSchema);