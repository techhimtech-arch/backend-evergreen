const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const { sendUnauthorized, sendForbidden } = require('../utils/response');
const logger = require('../config/logger');
const User = require('../models/User');

/**
 * Authentication middleware - verifies JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return sendUnauthorized(res, 'Access token is required');
    }

    const decoded = verifyAccessToken(token);
    
    // Find user with role and verify they exist and are active
    const user = await User.findById(decoded.userId).populate('roleId').select('-passwordHash');
    
    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    if (!user.isActive) {
      return sendUnauthorized(res, 'User account is deactivated');
    }

    // Attach user to request object
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.roleId.name,
      roleId: user.roleId._id,
      schoolId: user.schoolId,
    };

    logger.info('User authenticated successfully', {
      userId: user._id,
      email: user.email,
      role: user.roleId.name,
    });

    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    
    if (error.message.includes('expired')) {
      return sendUnauthorized(res, 'Token expired');
    } else if (error.message.includes('invalid')) {
      return sendUnauthorized(res, 'Invalid token');
    }
    
    return sendUnauthorized(res, 'Authentication failed');
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Array of allowed roles
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method,
      });

      return sendForbidden(res, 'Insufficient permissions');
    }

    logger.info('User authorized', {
      userId: req.user.userId,
      role: req.user.role,
      path: req.path,
      method: req.method,
    });

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).populate('roleId').select('-passwordHash');
      
      if (user && user.isActive) {
        req.user = {
          userId: user._id,
          email: user.email,
          role: user.roleId.name,
          roleId: user.roleId._id,
          schoolId: user.schoolId,
        };
      }
    }
    
    next();
  } catch (error) {
    // Optional auth should not fail the request
    logger.debug('Optional authentication failed', { error: error.message });
    next();
  }
};

/**
 * Check if user can access their own resource or has admin role
 */
const authorizeSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res, 'Authentication required');
  }

  const resourceUserId = req.params.userId || req.params.id;
  const isOwner = req.user.userId.toString() === resourceUserId;
  const isAdmin = ['superadmin', 'school_admin'].includes(req.user.role);

  if (!isOwner && !isAdmin) {
    return sendForbidden(res, 'You can only access your own resources');
  }

  next();
};

module.exports = {
  authenticate,
  authorizeRoles,
  optionalAuth,
  authorizeSelfOrAdmin,
};
