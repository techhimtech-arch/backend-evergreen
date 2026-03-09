const express = require('express');
const {
  getProfile,
  getAttendance,
  getFees,
  getResults,
} = require('../controllers/parentController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Parent Portal
 *   description: Parent portal routes - student fetched internally via parentUserId
 */

// =============================================
// Parent Portal Routes (parent only)
// Security: No studentId from frontend
// =============================================

/**
 * @swagger
 * /parent/profile:
 *   get:
 *     summary: Get parent profile with linked student info
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parent and student basic info
 *       404:
 *         description: Parent not found
 */
router.get('/profile', authMiddleware, authorizeRoles('parent'), getProfile);

/**
 * @swagger
 * /parent/attendance:
 *   get:
 *     summary: Get linked student's attendance records
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Student's attendance records
 *       404:
 *         description: No linked student found
 */
router.get('/attendance', authMiddleware, authorizeRoles('parent'), getAttendance);

/**
 * @swagger
 * /parent/fees:
 *   get:
 *     summary: Get linked student's fee details and payment history
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fee details (totalAmount, paidAmount, balanceAmount, paymentHistory)
 *       404:
 *         description: No linked student found
 */
router.get('/fees', authMiddleware, authorizeRoles('parent'), getFees);

/**
 * @swagger
 * /parent/results:
 *   get:
 *     summary: Get linked student's exam results
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examId
 *         schema:
 *           type: string
 *         description: Optional - Filter by specific exam
 *     responses:
 *       200:
 *         description: Subject-wise marks, total, and grade
 *       404:
 *         description: No linked student found
 */
router.get('/results', authMiddleware, authorizeRoles('parent'), getResults);

module.exports = router;