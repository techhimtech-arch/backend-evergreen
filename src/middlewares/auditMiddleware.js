const AuditLog = require('../models/AuditLog');

/**
 * Middleware to automatically log API requests
 * Should be used after authMiddleware to have access to user info
 */
const auditLogMiddleware = (action, resourceType = 'Other') => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to capture response
    res.json = function (data) {
      // Log the action after response is ready
      const logData = {
        userId: req.user?.userId,
        userName: req.user?.name,
        userRole: req.user?.role,
        schoolId: req.user?.schoolId,
        action,
        resourceType,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestId: req.requestId,
        success: res.statusCode < 400,
      };

      // Add resource ID if available
      if (req.params.id) {
        logData.resourceId = req.params.id;
      } else if (req.params.studentId) {
        logData.resourceId = req.params.studentId;
      } else if (req.params.userId) {
        logData.resourceId = req.params.userId;
      }

      // Add error message if failed
      if (!logData.success && data?.message) {
        logData.errorMessage = data.message;
      }

      // Log asynchronously - don't block response
      AuditLog.log(logData).catch(console.error);

      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

/**
 * Manual audit logging function for use in services/controllers
 */
const logAudit = async (options) => {
  const {
    req,
    action,
    resourceType,
    resourceId,
    previousValues,
    newValues,
    description,
    metadata,
    success = true,
    errorMessage,
  } = options;

  const logData = {
    userId: req?.user?.userId,
    userName: req?.user?.name,
    userRole: req?.user?.role,
    schoolId: req?.user?.schoolId,
    action,
    resourceType,
    resourceId,
    method: req?.method,
    path: req?.originalUrl,
    previousValues,
    newValues,
    description,
    metadata,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.headers?.['user-agent'],
    requestId: req?.requestId,
    success,
    errorMessage,
  };

  return AuditLog.log(logData);
};

/**
 * Log authentication event (login, logout, etc.)
 */
const logAuthEvent = async (options) => {
  const {
    action,
    userId,
    userName,
    userRole,
    schoolId,
    success = true,
    errorMessage,
    ipAddress,
    userAgent,
    metadata,
  } = options;

  const logData = {
    userId,
    userName,
    userRole,
    schoolId,
    action,
    resourceType: 'User',
    resourceId: userId,
    success,
    errorMessage,
    ipAddress,
    userAgent,
    metadata,
  };

  return AuditLog.log(logData);
};

module.exports = {
  auditLogMiddleware,
  logAudit,
  logAuthEvent,
};
