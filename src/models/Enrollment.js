const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
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
    rollNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ['enrolled', 'promoted', 'transferred_out', 'completed', 'dropped_out'],
      default: 'enrolled',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    promotionDate: {
      type: Date,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    // Academic performance summary for this enrollment
    academicSummary: {
      totalAttendance: { type: Number, default: 0 },
      presentDays: { type: Number, default: 0 },
      totalFees: { type: Number, default: 0 },
      paidFees: { type: Number, default: 0 },
      averageMarks: { type: Number, default: 0 },
    },
    // For tracking class teacher during this enrollment
    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Compound indexes for unique constraints and performance
enrollmentSchema.index({ studentId: 1, academicYearId: 1 }, { unique: true });
enrollmentSchema.index({ classId: 1, sectionId: 1, academicYearId: 1 });
enrollmentSchema.index({ schoolId: 1, academicYearId: 1 });
enrollmentSchema.index({ rollNumber: 1, sectionId: 1, academicYearId: 1 }, { sparse: true });

// Virtual for current status based on academic year
enrollmentSchema.virtual('isCurrent').get(function() {
  const currentYear = new Date().getFullYear();
  const enrollmentYear = new Date(this.enrollmentDate).getFullYear();
  return enrollmentYear === currentYear && this.status === 'enrolled';
});

// Static method to get current enrollment for a student
enrollmentSchema.statics.getCurrentEnrollment = async function(studentId, schoolId) {
  const AcademicYear = mongoose.model('AcademicYear');
  const currentYear = await AcademicYear.getCurrentYear(schoolId);
  
  return this.findOne({
    studentId,
    academicYearId: currentYear._id,
    status: 'enrolled'
  }).populate('classId sectionId academicYearId');
};

// Static method to get enrollment history for a student
enrollmentSchema.statics.getStudentHistory = async function(studentId, schoolId) {
  return this.find({ studentId, schoolId })
    .populate('classId sectionId academicYearId')
    .sort({ enrollmentDate: -1 });
};

// Instance method to promote student
enrollmentSchema.methods.promote = async function(newClassId, newSectionId, newRollNumber) {
  this.status = 'promoted';
  this.promotionDate = new Date();
  await this.save();
  
  // Create new enrollment for next academic year
  const AcademicYear = mongoose.model('AcademicYear');
  const nextYear = await AcademicYear.getCurrentYear(this.schoolId);
  
  const Enrollment = this.constructor;
  return Enrollment.create({
    studentId: this.studentId,
    academicYearId: nextYear._id,
    classId: newClassId,
    sectionId: newSectionId,
    rollNumber: newRollNumber,
    schoolId: this.schoolId,
    createdBy: this.createdBy,
  });
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
