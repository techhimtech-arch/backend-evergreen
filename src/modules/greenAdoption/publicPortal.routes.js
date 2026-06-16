const express = require('express');
const publicPortalController = require('./publicPortal.controller');

const router = express.Router();

// Publicly accessible endpoints (No authentication required)
router.get('/dashboard-metrics', publicPortalController.getDashboardMetrics);
router.get('/available-sites', publicPortalController.getAvailableSites);
router.get('/adopted-sites', publicPortalController.getAdoptedSites);
router.get('/csr-partners', publicPortalController.getCSRPartners);

module.exports = router;
