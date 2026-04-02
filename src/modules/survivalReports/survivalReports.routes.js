const express = require('express');
const { createReport, getReports } = require('./survivalReports.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Survival Reports
 *   description: Monitoring survival rate of planted trees
 */

/**
 * @swagger
 * /survival-reports:
 *   post:
 *     summary: Log a survival monitoring report (30/60/90 days)
 *     tags: [Survival Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               site:
 *                 type: string
 *                 description: ID of plantation site
 *               period:
 *                 type: number
 *                 enum: [30, 60, 90, 180, 365]
 *                 description: Monitoring period in days
 *               livePlants:
 *                 type: number
 *               deadPlants:
 *                 type: number
 *               replacementNeeded:
 *                 type: number
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report added successfully
 *   get:
 *     summary: Get all survival reports
 *     tags: [Survival Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of survival reports
 */
router.route('/').post(createReport).get(getReports);

module.exports = router;
