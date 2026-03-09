const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Assign class teacher to a class+section
// @route   POST /api/class-teacher/assign
// @access  Private (school_admin only)
exports.assignClassTeacher = asyncHandler(async (req, res, next) => {
  const { teacherId, classId, sectionId, academicYear } = req.body;
  const { schoolId } = req.user;

  // Verify teacher exists and belongs to same school
  const teacher = await User.findOne({
    _id: teacherId,
    schoolId,
    role: 'teacher',
    isActive: true
  });

  if (!teacher) {
    return next(new ErrorResponse('Teacher not found or not active', 404));
  }

  // Check if class+section already has a class teacher for this academic year
  const existingAssignment = await ClassTeacherAssignment.findOne({
    classId,
    sectionId,
    schoolId,
    academicYear,
    isActive: true
  });

  if (existingAssignment) {
    // Update existing assignment with new teacher
    existingAssignment.teacherId = teacherId;
    await existingAssignment.save();

    return res.status(200).json({
      success: true,
      message: 'Class teacher updated successfully',
      data: existingAssignment
    });
  }

  // Create new assignment
  const assignment = await ClassTeacherAssignment.create({
    teacherId,
    classId,
    sectionId,
    schoolId,
    academicYear
  });

  res.status(201).json({
    success: true,
    message: 'Class teacher assigned successfully',
    data: assignment
  });
});

// @desc    Get all class teacher assignments
// @route   GET /api/class-teacher
// @access  Private (school_admin)
exports.getClassTeacherAssignments = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.user;
  const { academicYear, classId } = req.query;

  const filter = { schoolId, isActive: true };
  if (academicYear) filter.academicYear = academicYear;
  if (classId) filter.classId = classId;

  const assignments = await ClassTeacherAssignment.find(filter)
    .populate('teacherId', 'name email')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: assignments.length,
    data: assignments
  });
});

// @desc    Get classes assigned to current teacher (as class teacher)
// @route   GET /api/class-teacher/my-classes
// @access  Private (teacher)
exports.getMyClassTeacherClasses = asyncHandler(async (req, res, next) => {
  const { userId: teacherId, schoolId } = req.user;

  const assignments = await ClassTeacherAssignment.find({
    teacherId,
    schoolId,
    isActive: true
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  res.status(200).json({
    success: true,
    count: assignments.length,
    data: assignments
  });
});

// @desc    Check if current user is class teacher of given class+section
// @route   GET /api/class-teacher/check/:classId/:sectionId
// @access  Private (teacher)
exports.checkClassTeacher = asyncHandler(async (req, res, next) => {
  const { classId, sectionId } = req.params;
  const { userId: teacherId, schoolId } = req.user;

  const assignment = await ClassTeacherAssignment.findOne({
    teacherId,
    classId,
    sectionId,
    schoolId,
    isActive: true
  });

  res.status(200).json({
    success: true,
    isClassTeacher: !!assignment,
    data: assignment
  });
});

// @desc    Remove class teacher assignment
// @route   DELETE /api/class-teacher/:id
// @access  Private (school_admin)
exports.removeClassTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { schoolId } = req.user;

  const assignment = await ClassTeacherAssignment.findOne({
    _id: id,
    schoolId
  });

  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  assignment.isActive = false;
  await assignment.save();

  res.status(200).json({
    success: true,
    message: 'Class teacher removed successfully'
  });
});

// @desc    Get class teacher for a specific class+section
// @route   GET /api/class-teacher/by-class/:classId/:sectionId
// @access  Private
exports.getClassTeacherByClass = asyncHandler(async (req, res, next) => {
  const { classId, sectionId } = req.params;
  const { schoolId } = req.user;

  const assignment = await ClassTeacherAssignment.findOne({
    classId,
    sectionId,
    schoolId,
    isActive: true
  }).populate('teacherId', 'name email');

  if (!assignment) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'No class teacher assigned'
    });
  }

  res.status(200).json({
    success: true,
    data: assignment
  });
});
