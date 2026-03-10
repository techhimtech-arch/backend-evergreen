const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const {
  createAcademicYear,
  getAllAcademicYears,
  getCurrentAcademicYear,
  getAcademicYear,
  updateAcademicYear,
  setCurrentAcademicYear,
  addTerm,
  addHoliday,
  deleteAcademicYear,
} = require('../controllers/academicYearController');

/**
 * @swagger
 * tags:
 *   name: Academic Years
 *   description: Academic year management endpoints
 */

/**
 * @swagger
 * /academic-years:
 *   get:
 *     summary: Get all academic years for the school
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of academic years
 *       401:
 *         description: Unauthorized
 */
// IMPORTANT: /current must be defined before /:id so "current" is not matched as id
/**
 * @swagger
 * /academic-years/current:
 *   get:
 *     summary: Get current academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current academic year
 *       404:
 *         description: No current academic year set
 */
router.get('/current', authMiddleware, getCurrentAcademicYear);

router.get('/', authMiddleware, getAllAcademicYears);

/**
 * @swagger
 * /academic-years/{id}:
 *   get:
 *     summary: Get academic year by ID
 *     tags: [Academic Years]
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
 *         description: Academic year details
 *       404:
 *         description: Not found
 */
router.get('/:id', authMiddleware, getAcademicYear);

/**
 * @swagger
 * /academic-years:
 *   post:
 *     summary: Create a new academic year
 *     tags: [Academic Years]
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
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: "2025-2026"
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               isCurrent:
 *                 type: boolean
 *               terms:
 *                 type: array
 *               holidays:
 *                 type: array
 *     responses:
 *       201:
 *         description: Academic year created
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  authMiddleware,
  roleGuard(['superadmin', 'school_admin']),
  createAcademicYear
);

/**
 * @swagger
 * /academic-years/{id}:
 *   put:
 *     summary: Update academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Academic year updated
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  authMiddleware,
  roleGuard(['superadmin', 'school_admin']),
  updateAcademicYear
);

/**
 * @swagger
 * /academic-years/{id}/set-current:
 *   put:
 *     summary: Set academic year as current
 *     tags: [Academic Years]
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
 *         description: Current academic year updated
 *       404:
 *         description: Not found
 */
router.put(
  '/:id/set-current',
  authMiddleware,
  roleGuard(['superadmin', 'school_admin']),
  setCurrentAcademicYear
);

/**
 * @swagger
 * /academic-years/{id}/terms:
 *   post:
 *     summary: Add term to academic year
 *     tags: [Academic Years]
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
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Term added
 */
router.post(
  '/:id/terms',
  authMiddleware,
  roleGuard(['superadmin', 'school_admin']),
  addTerm
);

/**
 * @swagger
 * /academic-years/{id}/holidays:
 *   post:
 *     summary: Add holiday to academic year
 *     tags: [Academic Years]
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
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Holiday added
 */
router.post(
  '/:id/holidays',
  authMiddleware,
  roleGuard(['superadmin', 'school_admin']),
  addHoliday
);

/**
 * @swagger
 * /academic-years/{id}:
 *   delete:
 *     summary: Delete academic year (soft delete)
 *     tags: [Academic Years]
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
 *         description: Academic year deleted
 *       400:
 *         description: Cannot delete current academic year
 */
router.delete(
  '/:id',
  authMiddleware,
  roleGuard(['superadmin', 'school_admin']),
  deleteAcademicYear
);

module.exports = router;
