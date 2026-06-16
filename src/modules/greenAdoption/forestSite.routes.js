const express = require('express');
const forestSiteController = require('./forestSite.controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// Admin Routes for Forest Sites
router.post('/', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), forestSiteController.createSite);
router.get('/', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'VOLUNTEER'), forestSiteController.getSites);
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'VOLUNTEER'), forestSiteController.getSiteById);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), forestSiteController.updateSite);
router.delete('/:id', authorizeRoles('SUPER_ADMIN'), forestSiteController.deleteSite);

// KML Upload route
router.post('/:id/kml', authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), forestSiteController.uploadKML);

module.exports = router;
