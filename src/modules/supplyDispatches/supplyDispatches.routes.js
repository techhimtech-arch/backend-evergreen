const express = require('express');
const router = express.Router();
const dispatchController = require('./supplyDispatches.controller');
const { dispatchValidation, updateStatusValidation, idValidation } = require('./supplyDispatches.validation');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

// Admin / Nursery Manager routes
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), dispatchValidation, dispatchController.createDispatch);
router.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), dispatchController.getDispatches);
router.get('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), idValidation, dispatchController.getDispatchById);
router.patch('/:id/status', authenticate, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), updateStatusValidation, dispatchController.updateStatus);

module.exports = router;
