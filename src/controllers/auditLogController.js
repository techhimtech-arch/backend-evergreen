const AuditLog = require('../models/AuditLog');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get audit logs for school
 * @route   GET /api/v1/audit-logs
 * @access  Private (school_admin, superadmin)
 */
exports.getAuditLogs = asyncHandler(async (req, res, next) => {
  const { schoolId, role } = req.user;
  const {
    page = 1,
    limit = 50,
    action,
    resourceType,
    userId,
    startDate,
    endDate,
    success,
  } = req.query;

  const query = {};

  // Superadmin can see all logs, school_admin only their school
  if (role !== 'superadmin') {
    query.schoolId = schoolId;
  }

  // Apply filters
  if (action) query.action = action;
  if (resourceType) query.resourceType = resourceType;
  if (userId) query.userId = userId;
  if (success !== undefined) query.success = success === 'true';

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    AuditLog.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: logs,
  });
});

/**
 * @desc    Get audit log by ID
 * @route   GET /api/v1/audit-logs/:id
 * @access  Private (school_admin, superadmin)
 */
exports.getAuditLogById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { schoolId, role } = req.user;

  const query = { _id: id };
  if (role !== 'superadmin') {
    query.schoolId = schoolId;
  }

  const log = await AuditLog.findOne(query)
    .populate('userId', 'name email role');

  if (!log) {
    return next(new ErrorResponse('Audit log not found', 404));
  }

  res.status(200).json({
    success: true,
    data: log,
  });
});

/**
 * @desc    Get user activity logs
 * @route   GET /api/v1/audit-logs/user/:userId
 * @access  Private (school_admin, superadmin)
 */
exports.getUserActivityLogs = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { schoolId, role } = req.user;
  const { page = 1, limit = 50, startDate, endDate } = req.query;

  const query = { userId };
  if (role !== 'superadmin') {
    query.schoolId = schoolId;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    AuditLog.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: logs,
  });
});

/**
 * @desc    Get audit log statistics
 * @route   GET /api/v1/audit-logs/stats
 * @access  Private (school_admin, superadmin)
 */
exports.getAuditLogStats = asyncHandler(async (req, res, next) => {
  const { schoolId, role } = req.user;
  const { startDate, endDate } = req.query;

  const matchQuery = {};
  if (role !== 'superadmin') {
    matchQuery.schoolId = schoolId;
  }

  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const [actionStats, resourceStats, dailyStats] = await Promise.all([
    // Actions by type
    AuditLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          successCount: { $sum: { $cond: ['$success', 1, 0] } },
          failureCount: { $sum: { $cond: ['$success', 0, 1] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    // Actions by resource type
    AuditLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$resourceType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
    // Daily activity (last 30 days)
    AuditLog.aggregate([
      {
        $match: {
          ...matchQuery,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      actionStats,
      resourceStats,
      dailyStats,
    },
  });
});

/**
 * @desc    Get available action types
 * @route   GET /api/v1/audit-logs/actions
 * @access  Private (school_admin, superadmin)
 */
exports.getActionTypes = asyncHandler(async (req, res, next) => {
  const actions = [
    'LOGIN',
    'LOGOUT',
    'LOGIN_FAILED',
    'PASSWORD_RESET_REQUEST',
    'PASSWORD_RESET',
    'TOKEN_REFRESH',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DELETE',
    'STUDENT_CREATE',
    'STUDENT_UPDATE',
    'STUDENT_DELETE',
    'CLASS_CREATE',
    'CLASS_UPDATE',
    'CLASS_DELETE',
    'ATTENDANCE_MARK',
    'FEE_PAYMENT_RECORD',
    'EXAM_CREATE',
    'RESULT_ADD',
    'REPORT_CARD_GENERATE',
    'ACADEMIC_YEAR_CREATE',
    'ACADEMIC_YEAR_UPDATE',
    'ACADEMIC_YEAR_SET_CURRENT',
  ];

  res.status(200).json({
    success: true,
    data: actions,
  });
});
