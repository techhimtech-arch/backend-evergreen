const express = require('express');
const {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  updateProgress,
  verifyAssignment,
  getOfficerAssignments
} = require('./assignments.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Target assignment management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Assignment:
 *       type: object
 *       required:
 *         - groupId
 *         - landArea
 *         - targetPlants
 *         - assignedOfficer
 *       properties:
 *         groupId:
 *           type: string
 *         landArea:
 *           type: number
 *         targetPlants:
 *           type: number
 *         species:
 *           type: array
 *           items:
 *             type: string
 *         assignedOfficer:
 *           type: string
 *         organizationId:
 *           type: string
 *
 * /api/v1/assignments:
 *   post:
 *     summary: Create a new target assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Assignment'
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *   get:
 *     summary: Get all assignments
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assignments
 */
router.route('/')
  .post(authenticate, createAssignment)
  .get(authenticate, getAssignments);

/**
 * @swagger
 * /api/v1/assignments/{id}:
 *   get:
 *     summary: Get assignment details
 *     tags: [Assignments]
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
 *         description: Assignment details returned successfully
 *   put:
 *     summary: Update assignment
 *     tags: [Assignments]
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
 *             $ref: '#/components/schemas/Assignment'
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *   delete:
 *     summary: Delete assignment
 *     tags: [Assignments]
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
 *         description: Assignment deleted successfully
 */
router.route('/:id')
  .get(authenticate, getAssignment)
  .put(authenticate, updateAssignment)
  .delete(authenticate, deleteAssignment);

/**
 * @swagger
 * /api/v1/assignments/{id}/progress:
 *   post:
 *     summary: Update assignment progress
 *     tags: [Assignments]
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
 *             type: object
 *             properties:
 *               plantsPlanted:
 *                 type: number
 *               notes:
 *                 type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.post('/:id/progress', authenticate, updateProgress);

/**
 * @swagger
 * /api/v1/assignments/{id}/verify:
 *   post:
 *     summary: Verify or reject assignment
 *     tags: [Assignments]
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
 *             type: object
 *             properties:
 *               approved:
 *                 type: boolean
 *               verificationNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment verified successfully
 */
router.post('/:id/verify', authenticate, verifyAssignment);

/**
 * @swagger
 * /api/v1/assignments/officer/{officerId}:
 *   get:
 *     summary: Get assignments by officer
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: officerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Officer assignments retrieved successfully
 */
router.get('/officer/:officerId', authenticate, getOfficerAssignments);

/**
 * @swagger
 * /api/v1/assignments/my-assignments:
 *   get:
 *     summary: Get current user's assignments (for officers)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My assignments retrieved successfully
 */
router.get('/my-assignments', authenticate, getOfficerAssignments);

module.exports = router;
