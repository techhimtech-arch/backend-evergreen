const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
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
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
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
    marksObtained: {
      type: Number,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
    },
    remarks: {
      type: String,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Updated indexes for enrollment-based queries
resultSchema.index({ enrollmentId: 1, examId: 1, subjectId: 1, schoolId: 1 }, { unique: true });
resultSchema.index({ studentId: 1, examId: 1, subjectId: 1, schoolId: 1 }, { unique: true, sparse: true }); // Legacy support
resultSchema.index({ academicYearId: 1, classId: 1, examId: 1 });

module.exports = mongoose.model('Result', resultSchema);