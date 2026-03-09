const TeacherAssignment = require('../models/TeacherAssignment');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

// @desc    Create a new teacher assignment
// @route   POST /api/v1/teacher-assignments
// @access  Private (superadmin, school_admin)
const createAssignment = asyncHandler(async (req, res, next) => {
  const { teacherId, classId, sectionId, subjectId } = req.body;
  const schoolId = req.user.schoolId;

  const assignment = await TeacherAssignment.create({
    teacherId,
    classId,
    sectionId,
    subjectId,
    schoolId
  });

  res.status(201).json({
    success: true,
    message: 'Teacher assignment created successfully',
    data: assignment
  });
});

// @desc    Get all teacher assignments
// @route   GET /api/v1/teacher-assignments
// @access  Private (superadmin, school_admin, teacher)
const getAssignments = asyncHandler(async (req, res, next) => {
  const { schoolId, role, _id: userId } = req.user;

  // Pagination
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const skip = (page - 1) * limit;

  // Build query
  let query = { schoolId: new mongoose.Types.ObjectId(schoolId) };

  // Default to active assignments only (unless explicitly filtering)
  if (req.query.isActive === undefined) {
    query.isActive = true;
  } else {
    query.isActive = req.query.isActive === 'true';
  }

  // Teachers can only see their own assignments
  if (role === 'teacher') {
    query.teacherId = new mongoose.Types.ObjectId(userId);
  }

  // Optional filters (admin only - teacher filter above takes precedence)
  if (role !== 'teacher' && req.query.teacherId) {
    query.teacherId = new mongoose.Types.ObjectId(req.query.teacherId);
  }
  if (req.query.classId) {
    query.classId = new mongoose.Types.ObjectId(req.query.classId);
  }
  if (req.query.sectionId) {
    query.sectionId = new mongoose.Types.ObjectId(req.query.sectionId);
  }

  const [totalCount, assignments] = await Promise.all([
    TeacherAssignment.countDocuments(query),
    TeacherAssignment.find(query)
      .populate('teacherId', 'name email')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    success: true,
    count: assignments.length,
    page,
    totalPages,
    data: assignments
  });
});

// @desc    Get single teacher assignment
// @route   GET /api/v1/teacher-assignments/:id
// @access  Private (superadmin, school_admin, teacher - own only)
const getAssignment = asyncHandler(async (req, res, next) => {
  const { schoolId, role, _id: userId } = req.user;

  const assignment = await TeacherAssignment.findOne({
    _id: req.params.id,
    schoolId
  })
    .populate('teacherId', 'name email')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name');

  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  // Teachers can only view their own assignments
  if (role === 'teacher' && assignment.teacherId._id.toString() !== userId.toString()) {
    return next(new ErrorResponse('Not authorized to view this assignment', 403));
  }

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Update teacher assignment
// @route   PATCH /api/v1/teacher-assignments/:id
// @access  Private (superadmin, school_admin)
const updateAssignment = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.user;
  const { teacherId, classId, sectionId, subjectId, isActive } = req.body;

  let assignment = await TeacherAssignment.findOne({
    _id: req.params.id,
    schoolId
  });

  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  // Update fields
  if (teacherId) assignment.teacherId = teacherId;
  if (classId) assignment.classId = classId;
  if (sectionId) assignment.sectionId = sectionId;
  if (subjectId) assignment.subjectId = subjectId;
  if (isActive !== undefined) assignment.isActive = isActive;

  await assignment.save();

  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully',
    data: assignment
  });
});

// @desc    Delete teacher assignment (soft delete)
// @route   DELETE /api/v1/teacher-assignments/:id
// @access  Private (superadmin, school_admin)
const deleteAssignment = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.user;

  const assignment = await TeacherAssignment.findOneAndUpdate(
    { _id: req.params.id, schoolId },
    { isActive: false },
    { new: true }
  );

  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully',
    data: {}
  });
});

// @desc    Get assignments by teacher
// @route   GET /api/v1/teacher-assignments/teacher/:teacherId
// @access  Private (superadmin, school_admin)
const getAssignmentsByTeacher = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.user;

  const assignments = await TeacherAssignment.find({
    teacherId: req.params.teacherId,
    schoolId,
    isActive: true
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name');

  res.status(200).json({
    success: true,
    count: assignments.length,
    data: assignments
  });
});

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByTeacher
};
