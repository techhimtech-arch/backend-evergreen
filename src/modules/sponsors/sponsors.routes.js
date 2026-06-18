const express = require('express');
const router = express.Router();
const sponsorController = require('./sponsors.controller');
const { createSponsorValidation, addFundValidation, idValidation } = require('./sponsors.validation');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

// Admin only routes
router.use(authenticate);
router.use(authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'));

router.post('/', createSponsorValidation, sponsorController.createSponsor);
router.get('/', sponsorController.getSponsors);
router.get('/:id', idValidation, sponsorController.getSponsorById);
router.post('/:id/fund', addFundValidation, sponsorController.addSponsorshipFund);

// PDF Report Generation Endpoint
router.get('/:id/report', idValidation, sponsorController.generateSponsorReport);

module.exports = router;
