const express = require('express');
const { createSite, getSites, getSite } = require('./plantationSites.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Plantation Sites
 *   description: Assigned plantation sites for groups
 */

/**
 * @swagger
 * /plantation-sites:
 *   post:
 *     summary: Assign a new plantation site to a group
 *     tags: [Plantation Sites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assignedGroup:
 *                 type: string
 *               areaName:
 *                 type: string
 *               areaSize:
 *                 type: number
 *               plantationTarget:
 *                 type: number
 *               species:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Site assigned successfully
 *   get:
 *     summary: Get all assigned sites
 *     tags: [Plantation Sites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sites
 */
router.route('/')
  .post(createSite)
  .get(getSites);

/**
 * @swagger
 * /plantation-sites/{id}:
 *   get:
 *     summary: Get a specific site by ID
 *     tags: [Plantation Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Site details
 */
router.route('/:id')
  .get(getSite);

module.exports = router;
