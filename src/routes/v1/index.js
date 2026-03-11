const express = require('express');
const router = express.Router();

// Import v1 routes
router.use('/auth', require('../../modules/auth/auth.routes'));
router.use('/users', require('../../modules/users/users.routes'));
router.use('/roles', require('../../modules/roles/roles.routes'));
router.use('/permissions', require('../../modules/permissions/permissions.routes'));

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
