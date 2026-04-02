const express = require('express');
const { createGroup, getGroups, getGroup, updateGroup, deleteGroup } = require('./groups.controller');
// const { protect, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Community group registration and management
 */

// router.use(protect);

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Register a new community group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Mahila Mandal, Yuvak Mandal, Self Help Group, Other]
 *               village:
 *                 type: string
 *               panchayat:
 *                 type: string
 *               district:
 *                 type: string
 *               leaderName:
 *                 type: string
 *               mobileNumber:
 *                 type: string
 *               totalMembers:
 *                 type: number
 *     responses:
 *       201:
 *         description: Group registered successfully
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 */
router
  .route('/')
  .post(createGroup) // authorize('State Admin', 'District Officer')
  .get(getGroups);

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Get group details
 *     tags: [Groups]
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
 *         description: Group details
 *   put:
 *     summary: Update group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Group updated
 *   delete:
 *     summary: Delete group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Group deleted
 */
router
  .route('/:id')
  .get(getGroup)
  .put(updateGroup) // authorize('State Admin', 'District Officer')
  .delete(deleteGroup); // authorize('State Admin')

module.exports = router;
