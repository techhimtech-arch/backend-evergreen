const express = require('express');
const organizationsController = require('./organizations.controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { createValidation, updateValidation, idValidation } = require('./organizations.validation');
const { body } = require('express-validator');

const router = express.Router();

router.use(authenticate);

// List and Create
router.route('/')
  .get(authorizeRoles('superadmin'), organizationsController.getOrganizations)
  .post(authorizeRoles('superadmin'), createValidation, validate, organizationsController.createOrganization);

// View, Update, Toggle & Delete  
router.route('/:id')
  .get(idValidation, validate, organizationsController.getOrganizationById)
  .put(authorizeRoles('superadmin'), updateValidation, validate, organizationsController.updateOrganization)
  .delete(authorizeRoles('superadmin'), idValidation, validate, organizationsController.deleteOrganization);

router.patch('/:id/status', 
  authorizeRoles('superadmin'),
  idValidation, 
  validate, 
  organizationsController.toggleStatus
);

module.exports = router;
