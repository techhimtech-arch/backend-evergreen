const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    // Keep studentId for backward compatibility and direct queries
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: false, // Made optional since enrollmentId is primary
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: false, // Optional - null for daily attendance, filled for subject-wise
    },
    attendanceType: {
      type: String,
      enum: ['daily', 'subject'],
      default: 'daily'
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
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave', 'Late'],
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Updated indexes for enrollment-based queries
attendanceSchema.index({ enrollmentId: 1, date: 1, schoolId: 1 }, { unique: true });
attendanceSchema.index({ studentId: 1, date: 1, schoolId: 1 }, { unique: true, sparse: true }); // Legacy support
attendanceSchema.index({ academicYearId: 1, classId: 1, sectionId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);