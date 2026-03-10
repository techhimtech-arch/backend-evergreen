const express = require('express');
const usersController = require('./users.controller');
const { authenticate, authorizeRoles, authorizeSelfOrAdmin } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  createUserValidation,
  updateUserValidation,
  getUsersValidation,
  userIdValidation,
} = require('./users.validation');
const { body } = require('express-validator');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// User management routes - Admin only
router.post('/', 
  authorizeRoles('superadmin', 'school_admin'),
  createUserValidation, 
  validate, 
  usersController.createUser
);

router.get('/', 
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  getUsersValidation, 
  validate, 
  usersController.getUsers
);

router.get('/search', 
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  usersController.searchUsers
);

router.get('/stats', 
  authorizeRoles('superadmin', 'school_admin'),
  usersController.getUserStats
);

router.post('/bulk-update', 
  authorizeRoles('superadmin', 'school_admin'),
  [
    body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
    body('updateData').isObject().withMessage('Update data object is required'),
    validate
  ],
  usersController.bulkUpdateUsers
);

// Individual user routes
router.get('/:userId', 
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  userIdValidation,
  validate,
  usersController.getUserById
);

router.put('/:userId', 
  authorizeRoles('superadmin', 'school_admin'),
  updateUserValidation, 
  validate,
  usersController.updateUser
);

router.delete('/:userId', 
  authorizeRoles('superadmin', 'school_admin'),
  userIdValidation,
  validate,
  usersController.deleteUser
);

router.delete('/:userId/hard', 
  authorizeRoles('superadmin'),
  userIdValidation,
  validate,
  usersController.hardDeleteUser
);

router.patch('/:userId/status', 
  authorizeRoles('superadmin', 'school_admin'),
  userIdValidation,
  [
    body('isActive').isBoolean().withMessage('isActive must be a boolean'),
    validate
  ],
  usersController.toggleUserStatus
);

router.post('/:userId/reset-password', 
  authorizeRoles('superadmin', 'school_admin'),
  userIdValidation,
  [
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    validate
  ],
  usersController.resetUserPassword
);

// Role-based user listing
router.get('/role/:role', 
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  [
    body('role').isIn(['superadmin', 'school_admin', 'teacher', 'accountant', 'parent', 'student']).withMessage('Invalid role'),
    validate
  ],
  usersController.getUsersByRole
);

// Self-service routes (users can access their own data)
router.get('/me/profile', 
  usersController.getProfile
);

router.put('/me/profile', 
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
    validate
  ],
  usersController.updateProfile
);

module.exports = router;
