const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics and analytics
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard statistics for school admin
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalStudents:
 *                           type: number
 *                         totalTeachers:
 *                           type: number
 *                         totalClasses:
 *                           type: number
 *                         totalSections:
 *                           type: number
 *                     attendance:
 *                       type: object
 *                       properties:
 *                         totalMarked:
 *                           type: number
 *                         presentCount:
 *                           type: number
 *                         absentCount:
 *                           type: number
 *                         attendancePercentage:
 *                           type: number
 *                     fees:
 *                       type: object
 *                       properties:
 *                         totalFeesCollected:
 *                           type: number
 *                         totalPendingFees:
 *                           type: number
 *                     exams:
 *                       type: object
 *                       properties:
 *                         totalExams:
 *                           type: number
 *                         totalResultsEntered:
 *                           type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User does not have required role
 *       500:
 *         description: Server error
 */

// GET /api/dashboard - Get dashboard stats (school_admin only)
router.get('/', authMiddleware, authorizeRoles('school_admin'), getDashboardStats);

module.exports = router;
