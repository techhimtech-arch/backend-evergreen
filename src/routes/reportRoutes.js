const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const {
  generateReportCard,
  viewReportCard,
  generateBulkReportCards,
  generateAttendanceReport,
} = require('../controllers/reportController');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Report generation endpoints (PDF)
 */

/**
 * @swagger
 * /reports/report-card/{studentId}/{examId}:
 *   get:
 *     summary: Generate and download report card PDF
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Student/Exam/Results not found
 *       403:
 *         description: Not authorized
 */
router.get(
  '/report-card/:studentId/:examId',
  authMiddleware,
  roleGuard(['superadmin', 'school_admin', 'teacher', 'parent']),
  generateReportCard
);

/**
 * @swagger
 * /reports/report-card/{studentId}/{examId}/view:
 *   get:
 *     summary: View report card PDF inline (in browser)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file for inline viewing
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get(
  '/report-card/:studentId/:examId/view',
  authMiddleware,
  roleGuard(['superadmin', 'school_admin', 'teacher', 'parent']),
  viewReportCard
);

/**
 * @swagger
 * /reports/report-cards/bulk:
 *   post:
 *     summary: Generate bulk report cards for a class
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - sectionId
 *               - examId
 *             properties:
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *               examId:
 *                 type: string
 *                 description: Exam ID
 *     responses:
 *       200:
 *         description: Bulk generation result
 *       400:
 *         description: Missing required fields
 */
router.post(
  '/report-cards/bulk',
  authMiddleware,
  roleGuard(['superadmin', 'school_admin']),
  generateBulkReportCards
);

/**
 * @swagger
 * /reports/attendance/{studentId}:
 *   get:
 *     summary: Generate attendance report PDF
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing date parameters
 */
router.get(
  '/attendance/:studentId',
  authMiddleware,
  roleGuard(['superadmin', 'school_admin', 'teacher', 'parent']),
  generateAttendanceReport
);

module.exports = router;
