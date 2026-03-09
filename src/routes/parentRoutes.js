const express = require('express');
const {
  createParent,
  linkParentToStudent,
  getParents,
  getMyChildren,
  getChildDetails,
  getChildAttendance,
  getChildFees,
  getChildResults,
} = require('../controllers/parentController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Parents
 *   description: Parent management and portal routes
 */

// =============================================
// Admin Routes (school_admin only)
// =============================================

/**
 * @swagger
 * /parents:
 *   post:
 *     summary: Create a new parent user
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               studentId:
 *                 type: string
 *                 description: Optional - Link parent to student immediately
 *     responses:
 *       201:
 *         description: Parent created successfully
 *       400:
 *         description: Validation error or email already in use
 *       403:
 *         description: Forbidden
 */
router.post('/', authMiddleware, authorizeRoles('school_admin'), createParent);

/**
 * @swagger
 * /parents:
 *   get:
 *     summary: Get all parents of the school
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of parents
 */
router.get('/', authMiddleware, authorizeRoles('school_admin'), getParents);

/**
 * @swagger
 * /parents/link-student:
 *   put:
 *     summary: Link a parent to a student
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - parentId
 *               - studentId
 *             properties:
 *               parentId:
 *                 type: string
 *               studentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Parent linked to student successfully
 *       404:
 *         description: Parent or student not found
 */
router.put('/link-student', authMiddleware, authorizeRoles('school_admin'), linkParentToStudent);

module.exports = router;
