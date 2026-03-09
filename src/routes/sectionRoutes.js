const express = require('express');
const {
  createSection,
  getSections,
  getSectionsByClass,
  updateSection,
  deleteSection,
} = require('../controllers/sectionController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');
const { validateSection } = require('../validators/sectionValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sections
 *   description: Section management for school admins
 */

/**
 * @swagger
 * /sections:
 *   post:
 *     summary: Create a new section
 *     tags: [Sections]
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
 *               classId:
 *                 type: string
 *               classTeacher:
 *                 type: string
 *     responses:
 *       201:
 *         description: Section created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', authMiddleware, authorizeRoles('school_admin'), validateSection, createSection);

/**
 * @swagger
 * /sections:
 *   get:
 *     summary: Get all sections of the logged-in school
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sections
 */
router.get('/', authMiddleware, authorizeRoles('school_admin'), getSections);

/**
 * @swagger
 * /sections/class/{classId}:
 *   get:
 *     summary: Get sections for a specific class
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of sections for the class
 */
router.get('/class/:classId', authMiddleware, authorizeRoles('school_admin'), getSectionsByClass);

/**
 * @swagger
 * /sections/{id}:
 *   patch:
 *     summary: Update a section
 *     tags: [Sections]
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
 *               name:
 *                 type: string
 *               classTeacher:
 *                 type: string
 *     responses:
 *       200:
 *         description: Section updated successfully
 */
router.patch('/:id', authMiddleware, authorizeRoles('school_admin'), updateSection);

/**
 * @swagger
 * /sections/{id}:
 *   delete:
 *     summary: Soft delete a section
 *     tags: [Sections]
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
 *         description: Section deleted successfully
 */
router.delete('/:id', authMiddleware, authorizeRoles('school_admin'), deleteSection);

module.exports = router;