const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../../controllers/dashboardController');
const { authenticate } = require('../../middleware/auth.middleware');

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
router.get('/', authenticate, getDashboardStats);

module.exports = router;