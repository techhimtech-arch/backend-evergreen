const express = require('express');
const router = express.Router();
const requestController = require('./plantRequests.controller');
const { createRequestValidation, updateStatusValidation, idValidation } = require('./plantRequests.validation');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

// Public or group leaders can request
router.post('/', authenticate, createRequestValidation, requestController.createRequest);
router.get('/', authenticate, requestController.getRequests);
router.get('/:id', authenticate, idValidation, requestController.getRequestById);

// Only admins can approve/reject
router.patch('/:id/status', authenticate, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), updateStatusValidation, requestController.updateStatus);

module.exports = router;
