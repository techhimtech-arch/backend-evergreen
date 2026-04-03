const express = require('express');
const { createAssignment, getAssignments, getAssignment } = require('./assignments.controller');

const router = express.Router();

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
 * 
 * /assignments:
 *   post:
 *     summary: Assign a new plantation site to a group
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
  .post(createAssignment)
  .get(getAssignments);

/**
 * @swagger
 * /assignments/{id}:
 *   get:
 *     summary: Get a specific assignment by ID
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
 *         description: Assignment details
 */
router.route('/:id')
  .get(getAssignment);

module.exports = router;
