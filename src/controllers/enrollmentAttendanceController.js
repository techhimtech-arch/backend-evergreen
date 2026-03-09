const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const enrollmentAttendanceService = require('../services/enrollmentAttendanceService');
const logger = require('../utils/logger');

// Validation middleware for attendance marking
const validateAttendanceMarking = [
  body('academicYearId')
    .notEmpty()
    .withMessage('Academic year is required')
    .isMongoId()
    .withMessage('Invalid academic year ID'),
  
  body('classId')
    .notEmpty()
    .withMessage('Class is required')
    .isMongoId()
    .withMessage('Invalid class ID'),
  
  body('sectionId')
    .notEmpty()
    .withMessage('Section is required')
    .isMongoId()
    .withMessage('Invalid section ID'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  
  body('attendanceRecords')
    .isArray({ min: 1 })
    .withMessage('Attendance records are required'),
  
  body('attendanceRecords.*.enrollmentId')
    .notEmpty()
    .withMessage('Enrollment ID is required')
    .isMongoId()
    .withMessage('Invalid enrollment ID'),
  
  body('attendanceRecords.*.status')
    .isIn(['Present', 'Absent', 'Leave', 'Late'])
    .withMessage('Status must be Present, Absent, Leave, or Late')
];

// Get enrollments for attendance marking
const getEnrollmentsForAttendance = asyncHandler(async (req, res) => {
  const { academicYearId, classId, sectionId } = req.query;
  const { schoolId } = req.user;

  if (!academicYearId) {
    return res.status(400).json({
      success: false,
      message: 'Academic year is required'
    });
  }

  const result = await enrollmentAttendanceService.getEnrollmentsForAttendance(
    academicYearId,
    classId,
    sectionId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get all enrollments for an academic year (all classes)
const getAllEnrollmentsForAcademicYear = asyncHandler(async (req, res) => {
  const { academicYearId } = req.query;
  const { schoolId } = req.user;

  if (!academicYearId) {
    return res.status(400).json({
      success: false,
      message: 'Academic year is required'
    });
  }

  const result = await enrollmentAttendanceService.getAllEnrollmentsForAcademicYear(
    academicYearId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Mark attendance for class
const markAttendance = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const attendanceData = {
    ...req.body,
    // Ensure date is properly formatted
    date: new Date(req.body.date).toISOString().split('T')[0]
  };

  const result = await enrollmentAttendanceService.markAttendance(
    attendanceData,
    req.user._id,
    req.user.schoolId
  );

  // Debug log to check result
  logger.info('Service result:', { result });

  // Handle result safely
  if (!result) {
    return res.status(500).json({
      success: false,
      message: 'Service returned no result'
    });
  }

  res.status(result.success ? 201 : 400).json(result);
});

// Get attendance by enrollment
const getAttendanceByEnrollment = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { startDate, endDate } = req.query;
  const { schoolId } = req.user;

  const result = await enrollmentAttendanceService.getAttendanceByEnrollment(
    enrollmentId,
    schoolId,
    startDate,
    endDate
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get class attendance summary for a specific date
const getClassAttendanceSummary = asyncHandler(async (req, res) => {
  const { academicYearId, classId, sectionId, date } = req.query;
  const { schoolId } = req.user;

  if (!academicYearId || !classId || !sectionId || !date) {
    return res.status(400).json({
      success: false,
      message: 'Academic year, class, section, and date are required'
    });
  }

  const result = await enrollmentAttendanceService.getClassAttendanceSummary(
    academicYearId,
    classId,
    sectionId,
    schoolId,
    date
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get class attendance statistics over a period
const getClassAttendanceStatistics = asyncHandler(async (req, res) => {
  const { academicYearId, classId, sectionId, startDate, endDate } = req.query;
  const { schoolId } = req.user;

  if (!academicYearId || !classId || !sectionId || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Academic year, class, section, start date, and end date are required'
    });
  }

  const result = await enrollmentAttendanceService.getClassAttendanceStatistics(
    academicYearId,
    classId,
    sectionId,
    schoolId,
    startDate,
    endDate
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get attendance dashboard data
const getAttendanceDashboard = asyncHandler(async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { academicYearId, classId, sectionId, date } = req.query;

    // Get today's attendance if date not provided
    const attendanceDate = date || new Date().toISOString().split('T')[0];

    let summary = {};
    if (academicYearId && classId && sectionId) {
      const result = await enrollmentAttendanceService.getClassAttendanceSummary(
        academicYearId,
        classId,
        sectionId,
        schoolId,
        attendanceDate
      );
      summary = result.data;
    }

    res.status(200).json({
      success: true,
      data: {
        date: attendanceDate,
        summary
      }
    });

  } catch (error) {
    logger.error('Failed to get attendance dashboard', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get attendance dashboard'
    });
  }
});

module.exports = {
  getEnrollmentsForAttendance,
  getAllEnrollmentsForAcademicYear,
  markAttendance,
  getAttendanceByEnrollment,
  getClassAttendanceSummary,
  getClassAttendanceStatistics,
  getAttendanceDashboard,
  validateAttendanceMarking
};
