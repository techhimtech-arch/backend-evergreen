const mongoose = require('mongoose');

const classTeacherAssignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required']
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required']
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Section ID is required']
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required']
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Each class+section can have only ONE class teacher per academic year
classTeacherAssignmentSchema.index(
  { classId: 1, sectionId: 1, schoolId: 1, academicYear: 1 },
  { unique: true }
);

// A teacher can be class teacher of multiple classes (index for quick lookup)
classTeacherAssignmentSchema.index({ teacherId: 1, schoolId: 1, isActive: 1 });

const ClassTeacherAssignment = mongoose.model('ClassTeacherAssignment', classTeacherAssignmentSchema);

module.exports = ClassTeacherAssignment;
