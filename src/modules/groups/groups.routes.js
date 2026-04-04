const express = require('express');
const { createGroup, getGroups, getGroup, updateGroup, deleteGroup } = require('./groups.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Community group management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - groupName
 *         - groupType
 *         - village
 *         - panchayat
 *         - district
 *         - leaderName
 *         - mobile
 *       properties:
 *         groupName:
 *           type: string
 *         groupType:
 *           type: string
 *           enum: [Mahila Mandal, Yuvak Mandal, Self Help Group, Other]        
 *         village:
 *           type: string
 *         panchayat:
 *           type: string
 *         district:
 *           type: string
 *         leaderName:
 *           type: string
 *         mobile:
 *           type: string
 *         membersCount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [Active, Inactive]
 *           default: Active
 *         organizationId:
 *           type: string
 *         isGlobal:
 *           type: boolean
 *           default: false
 *
 * /api/v1/groups:
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
 *             $ref: '#/components/schemas/Group'
 *     responses:
 *       201:
 *         description: Group created successfully
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 */
router.route('/')
  .post(authenticate, createGroup)
  .get(authenticate, getGroups);

/**
 * @swagger
 * /api/v1/groups/{id}:
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
 *         description: Group details returned successfully
 *   put:
 *     summary: Update group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Group'
 *     responses:
 *       200:
 *         description: Group updated successfully
 *   delete:
 *     summary: Delete group
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
 *         description: Group deleted successfully
 */
router.route('/:id')
  .get(authenticate, getGroup)
  .put(authenticate, updateGroup)
  .delete(authenticate, deleteGroup);

module.exports = router;
