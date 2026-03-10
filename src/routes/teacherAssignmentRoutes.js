const express = require('express');
const {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByTeacher
} = require('../controllers/teacherAssignmentController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleAuthorization');
const { validateCreateAssignment, validateUpdateAssignment } = require('../validators/teacherAssignmentValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TeacherAssignments
 *   description: Teacher assignment management
 */

/**
 * @swagger
 * /teacher-assignments:
 *   post:
 *     summary: Create a new teacher assignment
 *     tags: [TeacherAssignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teacherId
 *               - classId
 *               - sectionId
 *               - subjectId
 *             properties:
 *               teacherId:
 *                 type: string
 *                 description: Teacher's User ID
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *               subjectId:
 *                 type: string
 *                 description: Subject ID
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       400:
 *         description: Validation error or duplicate assignment
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.post(
  '/',
  authMiddleware,
  authorizeRoles('superadmin', 'school_admin'),
  validateCreateAssignment,
  createAssignment
);

/**
 * @swagger
 * /teacher-assignments:
 *   get:
 *     summary: Get all teacher assignments (teachers see only their own)
 *     tags: [TeacherAssignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page (max 100)
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *         description: Filter by teacher ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by class ID
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *         description: Filter by section ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of assignments with pagination
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authMiddleware,
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  getAssignments
);

/**
 * @swagger
 * /teacher-assignments/teacher/{teacherId}:
 *   get:
 *     summary: Get all assignments for a specific teacher
 *     tags: [TeacherAssignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher's User ID
 *     responses:
 *       200:
 *         description: List of assignments for the teacher
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/teacher/:teacherId',
  authMiddleware,
  authorizeRoles('superadmin', 'school_admin'),
  getAssignmentsByTeacher
);

/**
 * @swagger
 * /teacher-assignments/{id}:
 *   get:
 *     summary: Get a single assignment by ID
 *     tags: [TeacherAssignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Assignment details
 *       404:
 *         description: Assignment not found
 */
router.get(
  '/:id',
  authMiddleware,
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  getAssignment
);

/**
 * @swagger
 * /teacher-assignments/{id}:
 *   patch:
 *     summary: Update a teacher assignment
 *     tags: [TeacherAssignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teacherId:
 *                 type: string
 *               classId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       404:
 *         description: Assignment not found
 */
router.patch(
  '/:id',
  authMiddleware,
  authorizeRoles('superadmin', 'school_admin'),
  validateUpdateAssignment,
  updateAssignment
);

/**
 * @swagger
 * /teacher-assignments/{id}:
 *   delete:
 *     summary: Delete a teacher assignment
 *     tags: [TeacherAssignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 *       404:
 *         description: Assignment not found
 */
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('superadmin', 'school_admin'),
  deleteAssignment
);

module.exports = router;
