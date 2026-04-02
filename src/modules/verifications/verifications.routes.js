const express = require('express');
const { createVerification, getVerifications } = require('./verifications.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Verifications
 *   description: Field verification by Forest Guard
 */

/**
 * @swagger
 * /verifications:
 *   post:
 *     summary: Verify a plantation entry
 *     tags: [Verifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entry:
 *                 type: string
 *                 description: ID of plantation entry ID being verified
 *               actualPlantationCount:
 *                 type: number
 *               remarks:
 *                 type: string
 *               verificationPhotoUrl:
 *                 type: string
 *               outcome:
 *                 type: string
 *                 enum: [Approved, Rejected, Needs Rework]
 *     responses:
 *       201:
 *         description: Verification complete
 *   get:
 *     summary: List all verifications
 *     tags: [Verifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verifications list
 */
router.route('/').post(createVerification).get(getVerifications);

module.exports = router;
