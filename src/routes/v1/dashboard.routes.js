const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../../controllers/dashboardController');
const { authenticate } = require('../../middleware/auth.middleware');
const { cacheMiddleware } = require('../../config/redis');

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
// Cache dashboard response for 15 minutes (900 seconds)
router.get('/', authenticate, cacheMiddleware('dashboard:stats', 900), getDashboardStats);

module.exports = router;