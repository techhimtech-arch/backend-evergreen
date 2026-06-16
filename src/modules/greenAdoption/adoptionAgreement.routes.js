const express = require('express');
const adoptionAgreementController = require('./adoptionAgreement.controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// Admin / CSR creates agreement
router.post('/', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), adoptionAgreementController.createAgreement);

// Get agreements
router.get('/', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'CSR'), adoptionAgreementController.getAgreements);
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'CSR'), adoptionAgreementController.getAgreementById);

// Update agreement (e.g. renewal, upload signed doc)
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), adoptionAgreementController.updateAgreement);

module.exports = router;
