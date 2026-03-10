const express = require('express');
const {
  assignClassTeacher,
  getClassTeacherAssignments,
  getMyClassTeacherClasses,
  checkClassTeacher,
  removeClassTeacher,
  getClassTeacherByClass
} = require('../controllers/classTeacherController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleAuthorization');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Class Teacher
 *   description: Class Teacher assignment management
 */

/**
 * @swagger
 * /class-teacher/assign:
 *   post:
 *     summary: Assign a class teacher to a class+section
 *     tags: [Class Teacher]
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
 *               - academicYear
 *             properties:
 *               teacherId:
 *                 type: string
 *               classId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               academicYear:
 *                 type: string
 *                 example: "2025-2026"
 *     responses:
 *       201:
 *         description: Class teacher assigned successfully
 *       400:
 *         description: Bad request
 */
router.post(
  '/assign',
  authMiddleware,
  authorizeRoles('school_admin'),
  assignClassTeacher
);

/**
 * @swagger
 * /class-teacher:
 *   get:
 *     summary: Get all class teacher assignments
 *     tags: [Class Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Filter by academic year
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by class
 *     responses:
 *       200:
 *         description: List of class teacher assignments
 */
router.get(
  '/',
  authMiddleware,
  authorizeRoles('school_admin'),
  getClassTeacherAssignments
);

/**
 * @swagger
 * /class-teacher/my-classes:
 *   get:
 *     summary: Get classes where current user is class teacher
 *     tags: [Class Teacher]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned classes
 */
router.get(
  '/my-classes',
  authMiddleware,
  authorizeRoles('teacher'),
  getMyClassTeacherClasses
);

/**
 * @swagger
 * /class-teacher/check/{classId}/{sectionId}:
 *   get:
 *     summary: Check if current user is class teacher of given class+section
 *     tags: [Class Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Check result
 */
router.get(
  '/check/:classId/:sectionId',
  authMiddleware,
  authorizeRoles('teacher'),
  checkClassTeacher
);

/**
 * @swagger
 * /class-teacher/by-class/{classId}/{sectionId}:
 *   get:
 *     summary: Get class teacher for a specific class+section
 *     tags: [Class Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class teacher details
 */
router.get(
  '/by-class/:classId/:sectionId',
  authMiddleware,
  getClassTeacherByClass
);

/**
 * @swagger
 * /class-teacher/{id}:
 *   delete:
 *     summary: Remove class teacher assignment
 *     tags: [Class Teacher]
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
 *         description: Class teacher removed
 *       404:
 *         description: Assignment not found
 */
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('school_admin'),
  removeClassTeacher
);

module.exports = router;
