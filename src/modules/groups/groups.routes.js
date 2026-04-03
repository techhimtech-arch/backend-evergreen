const express = require('express');
const { createGroup, getGroups, getGroup, updateGroup, deleteGroup } = require('./groups.controller');

const router = express.Router();

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
 * 
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
  .post(createGroup)
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
 */
router.route('/:id')
  .get(getGroup)
  .put(updateGroup)
  .delete(deleteGroup);

module.exports = router;
