const reportService = require('../services/reportService');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const { logAudit } = require('../middlewares/auditMiddleware');
const Student = require('../models/Student');

/**
 * @desc    Generate report card PDF for a student
 * @route   GET /api/v1/reports/report-card/:studentId/:examId
 * @access  Private (school_admin, teacher, parent)
 */
exports.generateReportCard = asyncHandler(async (req, res, next) => {
  const { studentId, examId } = req.params;
  const { schoolId, role, userId } = req.user;

  // Parent authorization check
  if (role === 'parent') {
    const student = await Student.findOne({
      _id: studentId,
      parentUserId: userId,
      schoolId,
    });
    if (!student) {
      return next(new ErrorResponse('You are not authorized to access this student data', 403));
    }
  }

  const report = await reportService.generateReportCard(studentId, examId, schoolId);

  // Audit log
  await logAudit({
    req,
    action: 'REPORT_CARD_GENERATE',
    resourceType: 'ReportCard',
    resourceId: studentId,
    metadata: { examId },
    description: `Generated report card for student`,
  });

  // Set headers for PDF download
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${report.filename}"`,
    'Content-Length': report.buffer.length,
  });

  res.send(report.buffer);
});

/**
 * @desc    Generate report card PDF for viewing (inline)
 * @route   GET /api/v1/reports/report-card/:studentId/:examId/view
 * @access  Private (school_admin, teacher, parent)
 */
exports.viewReportCard = asyncHandler(async (req, res, next) => {
  const { studentId, examId } = req.params;
  const { schoolId, role, userId } = req.user;

  // Parent authorization check
  if (role === 'parent') {
    const student = await Student.findOne({
      _id: studentId,
      parentUserId: userId,
      schoolId,
    });
    if (!student) {
      return next(new ErrorResponse('You are not authorized to access this student data', 403));
    }
  }

  const report = await reportService.generateReportCard(studentId, examId, schoolId);

  // Set headers for inline viewing
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${report.filename}"`,
    'Content-Length': report.buffer.length,
  });

  res.send(report.buffer);
});

/**
 * @desc    Generate bulk report cards for a class
 * @route   POST /api/v1/reports/report-cards/bulk
 * @access  Private (school_admin)
 */
exports.generateBulkReportCards = asyncHandler(async (req, res, next) => {
  const { classId, sectionId, examId } = req.body;
  const { schoolId } = req.user;

  if (!classId || !sectionId || !examId) {
    return next(new ErrorResponse('classId, sectionId, and examId are required', 400));
  }

  const { reports, errors } = await reportService.generateBulkReportCards(
    classId,
    sectionId,
    examId,
    schoolId
  );

  // Audit log
  await logAudit({
    req,
    action: 'REPORT_CARD_GENERATE',
    resourceType: 'ReportCard',
    metadata: { classId, sectionId, examId, count: reports.length },
    description: `Generated bulk report cards: ${reports.length} successful, ${errors.length} failed`,
  });

  res.status(200).json({
    success: true,
    message: `Generated ${reports.length} report cards`,
    data: {
      successCount: reports.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
});

/**
 * @desc    Generate attendance report PDF for a student
 * @route   GET /api/v1/reports/attendance/:studentId
 * @access  Private (school_admin, teacher, parent)
 */
exports.generateAttendanceReport = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;
  const { schoolId, role, userId } = req.user;

  if (!startDate || !endDate) {
    return next(new ErrorResponse('startDate and endDate are required', 400));
  }

  // Parent authorization check
  if (role === 'parent') {
    const student = await Student.findOne({
      _id: studentId,
      parentUserId: userId,
      schoolId,
    });
    if (!student) {
      return next(new ErrorResponse('You are not authorized to access this student data', 403));
    }
  }

  const report = await reportService.generateAttendanceReport(studentId, startDate, endDate, schoolId);

  // Audit log
  await logAudit({
    req,
    action: 'DATA_EXPORT',
    resourceType: 'Attendance',
    resourceId: studentId,
    metadata: { startDate, endDate },
    description: `Generated attendance report for student`,
  });

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${report.filename}"`,
    'Content-Length': report.buffer.length,
  });

  res.send(report.buffer);
});
