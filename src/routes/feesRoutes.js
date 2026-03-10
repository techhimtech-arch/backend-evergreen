const express = require('express');
const {
  createFeeStructure,
  assignFeeToStudent,
  recordFeePayment,
  getStudentFeeDetails,
} = require('../controllers/feesController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleAuthorization');
const { validateCreateFeeStructure } = require('../validators/feeValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Fees
 *   description: Fees management APIs
 */

/**
 * @swagger
 * /fees/structure:
 *   post:
 *     summary: Create class fee structure
 *     tags: [Fees]
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
 *               - tuitionFee
 *             properties:
 *               classId:
 *                 type: string
 *                 description: Class ObjectId
 *               academicYear:
 *                 type: string
 *                 description: >
 *                   Optional academic year label (e.g. "2024-2025").
 *                   If omitted, the school's current academic year will be used.
 *               tuitionFee:
 *                 type: number
 *               transportFee:
 *                 type: number
 *               examFee:
 *                 type: number
 *               otherCharges:
 *                 type: number
 *     responses:
 *       201:
 *         description: Fee structure created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /fees/assign/{studentId}:
 *   post:
 *     summary: Assign fee to a student
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
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
 *               - classId
 *             properties:
 *               academicYear:
 *                 type: string
 *                 description: >
 *                   Optional academic year label (e.g. "2024-2025").
 *                   If omitted, the school's current academic year will be used.
 *               classId:
 *                 type: string
 *                 description: Class ObjectId to match fee structure
 *     responses:
 *       201:
 *         description: Fee assigned to student successfully
 *       404:
 *         description: Fee structure not found
 */

/**
 * @swagger
 * /fees/payment/{studentId}:
 *   post:
 *     summary: Record a fee payment
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
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
 *               - amount
 *               - paymentMode
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMode:
 *                 type: string
 *                 enum: [Cash, UPI, Bank]
 *               academicYear:
 *                 type: string
 *                 description: >
 *                   Optional academic year label (e.g. "2024-2025").
 *                   If omitted, the school's current academic year will be used
 *                   to locate the StudentFee record and tag the payment.
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *       404:
 *         description: Student fee record not found
 */

/**
 * @swagger
 * /fees/student/{studentId}:
 *   get:
 *     summary: Get student fee details
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: >
 *           Optional academic year label (e.g. "2024-2025").
 *           If provided, returns fee summary and payment history for that year.
 *           If omitted, returns the most recent academic year's record.
 *     responses:
 *       200:
 *         description: Student fee details retrieved successfully
 *       404:
 *         description: Student fee record not found
 */

// Apply authentication and authorization middleware
router.use(protect);
router.use(authorizeRoles('school_admin', 'accountant'));

// Routes
router.post('/structure', validateCreateFeeStructure, createFeeStructure);
router.post('/assign/:studentId', assignFeeToStudent);
router.post('/payment/:studentId', recordFeePayment);
router.get('/student/:studentId', getStudentFeeDetails);

module.exports = router;
