const express = require('express');
const adoptionProposalController = require('./adoptionProposal.controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// CSR Partner submits proposal
router.post('/', authorizeRoles('CSR', 'ORG_ADMIN'), adoptionProposalController.createProposal);

// Get proposals
router.get('/', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'CSR'), adoptionProposalController.getProposals);
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'CSR'), adoptionProposalController.getProposalById);

// Forest Officer reviews proposal
router.patch('/:id/review', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), adoptionProposalController.reviewProposal);

module.exports = router;
