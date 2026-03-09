const enrollmentService = require('../services/enrollmentService');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateEnrollment = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('academicYearId').notEmpty().withMessage('Academic Year ID is required'),
  body('classId').notEmpty().withMessage('Class ID is required'),
  body('sectionId').notEmpty().withMessage('Section ID is required'),
  body('schoolId').notEmpty().withMessage('School ID is required'),
  body('rollNumber').optional().isString().withMessage('Roll number must be a string'),
];

const validatePromotion = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('currentEnrollmentId').notEmpty().withMessage('Current Enrollment ID is required'),
  body('newClassId').notEmpty().withMessage('New Class ID is required'),
  body('newSectionId').notEmpty().withMessage('New Section ID is required'),
  body('newRollNumber').optional().isString().withMessage('New Roll number must be a string'),
];

// Enroll student
const enrollStudent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const result = await enrollmentService.enrollStudent(req.body);
  res.status(result.statusCode).json(result);
});

// Get current enrollment for student
const getCurrentEnrollment = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const schoolId = req.user.schoolId;

  const result = await enrollmentService.getCurrentEnrollment(studentId, schoolId);
  res.status(result.statusCode).json(result);
});

// Get student enrollment history
const getStudentHistory = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const schoolId = req.user.schoolId;

  const result = await enrollmentService.getStudentHistory(studentId, schoolId);
  res.status(result.statusCode).json(result);
});

// Promote student
const promoteStudent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const result = await enrollmentService.promoteStudent(req.body);
  res.status(result.statusCode).json(result);
});

// Get class enrollments
const getClassEnrollments = asyncHandler(async (req, res) => {
  const { classId, sectionId, academicYearId } = req.query;
  const schoolId = req.user.schoolId;

  if (!classId || !sectionId || !academicYearId) {
    return res.status(400).json({
      success: false,
      message: 'Class ID, Section ID, and Academic Year ID are required',
    });
  }

  const result = await enrollmentService.getClassEnrollments(
    classId,
    sectionId,
    academicYearId,
    schoolId
  );
  res.status(result.statusCode).json(result);
});

// Bulk enroll students
const bulkEnrollStudents = asyncHandler(async (req, res) => {
  const { enrollments } = req.body;

  if (!enrollments || !Array.isArray(enrollments)) {
    return res.status(400).json({
      success: false,
      message: 'Enrollments array is required',
    });
  }

  const result = await enrollmentService.bulkEnrollStudents(enrollments);
  res.status(result.statusCode).json(result);
});

module.exports = {
  enrollStudent,
  getCurrentEnrollment,
  getStudentHistory,
  promoteStudent,
  getClassEnrollments,
  bulkEnrollStudents,
  validateEnrollment,
  validatePromotion,
};
