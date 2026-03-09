const express = require('express');
const {
  createSubject,
  getSubjects,
  getSubjectsByClass,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Subject management for school admins
 */

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
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
 *               - classId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the subject
 *                 example: Mathematics
 *               classId:
 *                 type: string
 *                 description: ID of the class this subject belongs to
 *                 example: 60d5ecb54b24a1234567890a
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       400:
 *         description: Subject already exists for this class
 *       404:
 *         description: Class not found
 */
router.post('/', authMiddleware, authorizeRoles('school_admin'), createSubject);

/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: Get all subjects for the logged-in school
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subjects
 */
router.get('/', authMiddleware, authorizeRoles('school_admin'), getSubjects);

/**
 * @swagger
 * /subjects/class/{classId}:
 *   get:
 *     summary: Get subjects for a specific class
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: List of subjects for the class
 */
router.get('/class/:classId', authMiddleware, authorizeRoles('school_admin'), getSubjectsByClass);

/**
 * @swagger
 * /subjects/{id}:
 *   patch:
 *     summary: Update a subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name of the subject
 *                 example: Advanced Mathematics
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       400:
 *         description: Subject with this name already exists
 *       404:
 *         description: Subject not found
 */
router.patch('/:id', authMiddleware, authorizeRoles('school_admin'), updateSubject);

/**
 * @swagger
 * /subjects/{id}:
 *   delete:
 *     summary: Soft delete a subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       404:
 *         description: Subject not found
 */
router.delete('/:id', authMiddleware, authorizeRoles('school_admin'), deleteSubject);

module.exports = router;
