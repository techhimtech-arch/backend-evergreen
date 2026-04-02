const express = require('express');
const { getDashboardStats } = require('./dashboard.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get overview stats for HP Evergreen Dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats containing totals and survival %
 */
router.route('/stats').get(getDashboardStats);

module.exports = router;
