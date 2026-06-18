const express = require('express');
const router = express.Router();
const nurseryController = require('./nurseries.controller');
const { createValidation, updateStockValidation, idValidation } = require('./nurseries.validation');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

// Public or generic authenticated routes
router.get('/', authenticate, nurseryController.getNurseries);
router.get('/:id', authenticate, idValidation, nurseryController.getNurseryById);

// Admin / Nursery Manager routes
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), createValidation, nurseryController.createNursery);
router.patch('/:id/stock', authenticate, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), updateStockValidation, nurseryController.updateStock);

module.exports = router;
