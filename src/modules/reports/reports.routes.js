const express = require('express');
const router = express.Router();
const { getSummaryReport, getGroupReport } = require('./reports.controller');
const { authenticate } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Plantation reports and analytics
 */

/**
 * @swagger
 * /reports/summary:
 *   get:
 *     summary: Get summary plantation report (org-wise, monthly trend, species)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter trees planted from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter trees planted until this date
 *     responses:
 *       200:
 *         description: Summary report with overview, org-wise breakdown, monthly trend
 */
router.get('/summary', authenticate, getSummaryReport);

/**
 * @swagger
 * /reports/groups:
 *   get:
 *     summary: Get group-wise plantation report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Group-wise tree counts and survival rates
 */
router.get('/groups', authenticate, getGroupReport);

module.exports = router;
