const express = require('express');
const router = express.Router();

const {
  createFeeStructure,
  getFeeStructures,
  getStudentFeeSummary,
  getClassFeeSummary,
  processPayment,
  getOverdueFees,
  getPaymentHistory,
  generateFeeReport,
  sendFeeReminders,
  getFeeDashboard,
  getStudentFeeDetails,
  getFeeReceipt,
  validateFeeStructure,
  validatePayment
} = require('../controllers/feeController');

const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');

/**
 * @swagger
 * tags:
 *   name: Fee Management
 *   description: Enrollment-based fee management system
 */

/**
 * @swagger
 * /fees/structure:
 *   post:
 *     summary: Create fee structure for a class
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - academicYearId
 *               - classId
 *               - feeType
 *               - feeName
 *               - amount
 *               - dueDate
 *             properties:
 *               academicYearId:
 *                 type: string
 *                 description: Academic year ID
 *                 example: "65aa221b8f9e8a001c9e4a1b"
 *               classId:
 *                 type: string
 *                 description: Class ID
 *                 example: "65bb331b8f9e8a001c9e4a1c"
 *               feeType:
 *                 type: string
 *                 enum: [tuition, transport, admission, exam, library, laboratory, sports, other]
 *                 description: Type of fee
 *                 example: "tuition"
 *               feeName:
 *                 type: string
 *                 description: Name of the fee
 *                 example: "Monthly Tuition Fee"
 *               amount:
 *                 type: number
 *                 description: Fee amount
 *                 example: 5000
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date for the fee
 *                 example: "2026-04-01"
 *               lateFee:
 *                 type: number
 *                 description: Late fee amount
 *                 example: 100
 *               concessionPercentage:
 *                 type: number
 *                 description: Concession percentage
 *                 example: 10
 *     responses:
 *       201:
 *         description: Fee structure created successfully
 *       400:
 *         description: Validation error or bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/structure', authMiddleware, authorizeRoles('school_admin'), validateFeeStructure, createFeeStructure);

/**
 * @swagger
 * /fees/structure:
 *   get:
 *     summary: Get fee structures for a class
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYearId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *       - in: query
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Fee structures retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/structure', authMiddleware, authorizeRoles('school_admin', 'teacher'), getFeeStructures);

/**
 * @swagger
 * /fees/student/{studentId}:
 *   get:
 *     summary: Get student fee summary
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: query
 *         name: academicYearId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Student fee summary retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/student/:studentId', authMiddleware, authorizeRoles('school_admin', 'teacher', 'parent'), getStudentFeeSummary);

/**
 * @swagger
 * /fees/class-summary:
 *   get:
 *     summary: Get class fee summary
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: query
 *         name: academicYearId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Class fee summary retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/class-summary', authMiddleware, authorizeRoles('school_admin', 'teacher'), getClassFeeSummary);

/**
 * @swagger
 * /fees/pay:
 *   post:
 *     summary: Process fee payment
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feeId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               feeId:
 *                 type: string
 *                 description: Fee ID
 *                 example: "65dd12ab8f9e8a001c9e4a1e"
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *                 example: 2500
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, cheque, bank_transfer, online, card, upi]
 *                 description: Payment method
 *                 example: "cash"
 *               transactionId:
 *                 type: string
 *                 description: Transaction ID for online payments
 *                 example: "TXN123456789"
 *               remarks:
 *                 type: string
 *                 description: Payment remarks
 *                 example: "Partial payment for March tuition"
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *       400:
 *         description: Validation error or bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/pay', authMiddleware, authorizeRoles('school_admin', 'teacher'), validatePayment, processPayment);

/**
 * @swagger
 * /fees/overdue:
 *   get:
 *     summary: Get overdue fees
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue fees retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/overdue', authMiddleware, authorizeRoles('school_admin', 'teacher'), getOverdueFees);

/**
 * @swagger
 * /fees/payment-history:
 *   get:
 *     summary: Get payment history
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for payment history
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for payment history
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by class ID
 *       - in: query
 *         name: feeType
 *         schema:
 *           type: string
 *         description: Filter by fee type
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *         description: Filter by payment method
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/payment-history', authMiddleware, authorizeRoles('school_admin', 'teacher'), getPaymentHistory);

/**
 * @swagger
 * /fees/reports/{reportType}:
 *   get:
 *     summary: Generate fee reports
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [class-wise, payment-history, overdue, collection-summary]
 *         description: Type of report to generate
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Academic year ID (for class-wise reports)
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID (for class-wise reports)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (for collection-summary)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (for collection-summary)
 *     responses:
 *       200:
 *         description: Report generated successfully
 *       400:
 *         description: Bad request or invalid report type
 *       401:
 *         description: Unauthorized
 */
router.get('/reports/:reportType', authMiddleware, authorizeRoles('school_admin', 'teacher'), generateFeeReport);

/**
 * @swagger
 * /fees/reminders:
 *   post:
 *     summary: Send fee reminders
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reminderType:
 *                 type: string
 *                 enum: [overdue, upcoming]
 *                 default: overdue
 *                 description: Type of reminders to send
 *                 example: "overdue"
 *     responses:
 *       200:
 *         description: Reminders sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/reminders', authMiddleware, authorizeRoles('school_admin'), sendFeeReminders);

/**
 * @swagger
 * /fees/dashboard:
 *   get:
 *     summary: Get fee dashboard data
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Academic year ID (for class-specific dashboard)
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID (for class-specific dashboard)
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authMiddleware, authorizeRoles('school_admin', 'teacher'), getFeeDashboard);

/**
 * @swagger
 * /fees/student/{studentId}/payment-details:
 *   get:
 *     summary: Get student fee details for payment
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: query
 *         name: academicYearId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Student fee details retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/student/:studentId/payment-details', authMiddleware, authorizeRoles('school_admin', 'teacher', 'parent'), getStudentFeeDetails);

/**
 * @swagger
 * /fees/{feeId}/receipt/{receiptNumber}:
 *   get:
 *     summary: Get fee receipt
 *     tags: [Fee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee ID
 *       - in: path
 *         name: receiptNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Receipt number
 *     responses:
 *       200:
 *         description: Fee receipt retrieved successfully
 *       404:
 *         description: Fee receipt not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:feeId/receipt/:receiptNumber', authMiddleware, authorizeRoles('school_admin', 'teacher', 'parent'), getFeeReceipt);

module.exports = router;
