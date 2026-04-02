const express = require('express');
const router = express.Router();

// Import v1 routes
router.use('/auth', require('../../modules/auth/auth.routes'));
router.use('/users', require('../../modules/users/users.routes'));
router.use('/roles', require('../../modules/roles/roles.routes'));
router.use('/permissions', require('../../modules/permissions/permissions.routes'));
router.use('/groups', require('../../modules/groups/groups.routes'));
router.use('/plantation-sites', require('../../modules/plantationSites/plantationSites.routes'));
router.use('/plantation-entries', require('../../modules/plantationEntries/plantationEntries.routes'));
router.use('/verifications', require('../../modules/verifications/verifications.routes'));
router.use('/survival-reports', require('../../modules/survivalReports/survivalReports.routes'));
router.use('/dashboard', require('../../modules/dashboard/dashboard.routes'));



// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API v1 is running',
    timestamp: new Date().toISOString(),
    version: 'v1'
  });
});

module.exports = router;
