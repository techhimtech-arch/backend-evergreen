const express = require('express');
const router = express.Router();

// Import v1 routes
router.use('/auth', require('../../modules/auth/auth.routes'));
router.use('/users', require('../../modules/users/users.routes'));
router.use('/organizations', require('../../modules/organizations/organizations.routes'));
router.use('/roles', require('../../modules/roles/roles.routes'));
router.use('/permissions', require('../../modules/permissions/permissions.routes'));
router.use('/groups', require('../../modules/groups/groups.routes'));
router.use('/assignments', require('../../modules/assignments/assignments.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/plants', require('../../modules/plants/plants.routes'));
router.use('/trees', require('../../modules/trees/trees.routes'));
router.use('/tree-photos', require('../../modules/treePhotos/treePhotos.routes'));
router.use('/tree-monitoring', require('../../modules/treeMonitoring/treeMonitoring.routes'));
router.use('/events', require('../../modules/plantationEvents/plantationEvents.routes'));
router.use('/inspections', require('../../modules/inspections/inspections.routes'));
router.use('/reports', require('../../modules/reports/reports.routes'));
router.use('/nurseries', require('../../modules/nurseries/nurseries.routes'));
router.use('/plant-requests', require('../../modules/plantRequests/plantRequests.routes'));
router.use('/supply-dispatches', require('../../modules/supplyDispatches/supplyDispatches.routes'));
router.use('/sponsors', require('../../modules/sponsors/sponsors.routes'));

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
