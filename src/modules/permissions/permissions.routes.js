const express = require('express');
const router = express.Router();

const {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionsByRole
} = require('./permissions.controller');

const { authenticateToken, authorizePermissions } = require('../../middleware/rbac.middleware');
const validate = require('./permissions.validation');

// Public routes (none for permissions - all require authentication)

// GET /api/permissions - Get all permissions
router.get('/', 
  authenticateToken,
  authorizePermissions('VIEW_PERMISSIONS'),
  validate.getPermissions,
  getPermissions
);

// GET /api/permissions/:id - Get permission by ID
router.get('/:id', 
  authenticateToken,
  authorizePermissions('VIEW_PERMISSIONS'),
  validate.getPermissionById,
  getPermissionById
);

// POST /api/permissions - Create new permission
router.post('/', 
  authenticateToken,
  authorizePermissions('CREATE_PERMISSION'),
  validate.createPermission,
  createPermission
);

// PUT /api/permissions/:id - Update permission
router.put('/:id', 
  authenticateToken,
  authorizePermissions('UPDATE_PERMISSION'),
  validate.updatePermission,
  updatePermission
);

// DELETE /api/permissions/:id - Delete permission
router.delete('/:id', 
  authenticateToken,
  authorizePermissions('DELETE_PERMISSION'),
  validate.deletePermission,
  deletePermission
);

// GET /api/permissions/role/:roleId - Get permissions for a specific role
router.get('/role/:roleId', 
  authenticateToken,
  authorizePermissions('VIEW_ROLES'),
  validate.getPermissionsByRole,
  getPermissionsByRole
);

module.exports = router;
