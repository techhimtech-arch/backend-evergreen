const express = require('express');
const { createAssignment, getAssignments, getAssignment } = require('./assignments.controller');

const router = express.Router();

/**
 * @swagger
 * /assignments:
 *   post:
 *     summary: Assign a new plantation site to a group
 *     tags: [Assignments]
 *   get:
 *     summary: Get all assignments
 *     tags: [Assignments]
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
 */
router.route('/:id')
  .get(getAssignment);

module.exports = router;
