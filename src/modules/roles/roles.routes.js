const express = require('express');
const rolesController = require('./roles.controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { body } = require('express-validator');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all roles - accessible to multiple roles
router.get('/', 
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  rolesController.getRoles
);

// Get available permissions - admin only
router.get('/permissions', 
  authorizeRoles('superadmin', 'school_admin'),
  rolesController.getAvailablePermissions
);

// Get role statistics - admin only
router.get('/stats', 
  authorizeRoles('superadmin', 'school_admin'),
  rolesController.getRoleStats
);

// Create role - superadmin only
router.post('/', 
  authorizeRoles('superadmin'),
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('description').trim().isLength({ min: 5, max: 200 }).withMessage('Description must be between 5 and 200 characters'),
    body('permissions').isArray({ min: 1 }).withMessage('At least one permission is required'),
    body('schoolId').optional().isMongoId().withMessage('Invalid school ID'),
    validate
  ],
  rolesController.createRole
);

// Individual role routes
router.get('/:name', 
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  rolesController.getRoleByName
);

router.get('/:name/permissions', 
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  rolesController.getRolePermissions
);

router.get('/:name/permissions/:permission', 
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  rolesController.checkRolePermission
);

router.put('/:name', 
  authorizeRoles('superadmin'),
  [
    body('description').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Description must be between 5 and 200 characters'),
    body('permissions').optional().isArray().withMessage('Permissions must be an array'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    validate
  ],
  rolesController.updateRole
);

router.delete('/:name', 
  authorizeRoles('superadmin'),
  rolesController.deleteRole
);

router.post('/:name/permissions', 
  authorizeRoles('superadmin'),
  [
    body('permissions').isArray({ min: 1 }).withMessage('At least one permission is required'),
    validate
  ],
  rolesController.assignPermissions
);

module.exports = router;
