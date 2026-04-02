const express = require('express');
const { createEntry, getEntries, getEntry } = require('./plantationEntries.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Plantation Entries
 *   description: Plantation activity submission
 */

/**
 * @swagger
 * /plantation-entries:
 *   post:
 *     summary: Submit a new plantation entry (by Group Leader)
 *     tags: [Plantation Entries]
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
 *                 description: ID of assigned plantation site
 *               group:
 *                 type: string
 *                 description: ID of group submitting
 *               plantationDate:
 *                 type: string
 *                 format: date
 *               totalPlanted:
 *                 type: number
 *               attendanceCount:
 *                 type: number
 *               remarks:
 *                 type: string
 *               photoUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Plantation entry logged successfully
 *   get:
 *     summary: Get all plantation entries
 *     tags: [Plantation Entries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of plantation entries
 */
router.route('/').post(createEntry).get(getEntries);

/**
 * @swagger
 * /plantation-entries/{id}:
 *   get:
 *     summary: Get specific plantation entry details
 *     tags: [Plantation Entries]
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
 *         description: Details of a plantation entry
 *       404:
 *         description: Entry not found
 */
router.route('/:id').get(getEntry);

module.exports = router;
