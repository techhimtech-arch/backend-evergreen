const express = require('express');
const router = express.Router();

const {
  getEnrollmentsForAttendance,
  getAllEnrollmentsForAcademicYear,
  markAttendance,
  getAttendanceByEnrollment,
  getClassAttendanceSummary,
  getClassAttendanceStatistics,
  getAttendanceDashboard,
  validateAttendanceMarking
} = require('../controllers/enrollmentAttendanceController');

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleAuthorization');

/**
 * @swagger
 * tags:
 *   name: Enrollment Attendance
 *   description: Enrollment-based attendance management
 */

// Put all-enrollments first to avoid conflicts
router.get('/all-enrollments', authMiddleware, authorizeRoles('school_admin', 'teacher'), getAllEnrollmentsForAcademicYear);

// Debug route to test if service loads
router.get('/debug-test', (req, res) => {
  try {
    const service = require('../services/enrollmentAttendanceService');
    res.json({
      success: true,
      message: 'Service loaded successfully',
      serviceMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(service))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Service loading failed',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /attendance/enrollments:
 *   get:
 *     summary: Get enrollments for attendance marking
 *     tags: [Enrollment Attendance]
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
 *       - in: query
 *         name: sectionId
 *         required: false
 *         schema:
 *           type: string
 *         description: Section ID (optional - if not provided, returns all sections of the class)
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/enrollments', authMiddleware, authorizeRoles('school_admin', 'teacher'), getEnrollmentsForAttendance);

/**
 * @swagger
 * /attendance/all-enrollments:
 *   get:
 *     summary: Get all enrollments for an academic year (all classes)
 *     tags: [Enrollment Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYearId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: All enrollments retrieved successfully
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
 *                     totalEnrollments:
 *                       type: integer
 *                       example: 150
 *                     enrollmentsByClass:
 *                       type: object
 *                       example:
 *                         "6th Grade":
 *                           - enrollmentId: "enroll_1"
 *                             studentName: "Rahul Sharma"
 *                             className: "6th Grade"
 *                             sectionName: "A"
 *                             rollNumber: 1
 *                         "7th Grade":
 *                           - enrollmentId: "enroll_2"
 *                             studentName: "Priya Patel"
 *                             className: "7th Grade"
 *                             sectionName: "B"
 *                             rollNumber: 2
 *                     allEnrollments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           enrollmentId:
 *                             type: string
 *                           studentName:
 *                             type: string
 *                           className:
 *                             type: string
 *                           sectionName:
 *                             type: string
 *                           rollNumber:
 *                             type: integer
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/all-enrollments', authMiddleware, authorizeRoles('school_admin', 'teacher'), getAllEnrollmentsForAcademicYear);

/**
 * @swagger
 * /attendance/mark:
 *   post:
 *     summary: Mark attendance for multiple students
 *     tags: [Enrollment Attendance]
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
 *               - sectionId
 *               - date
 *               - attendanceRecords
 *             properties:
 *               academicYearId:
 *                 type: string
 *                 description: Academic year ID
 *                 example: "65aa221b8f9e8a001c9e4a1b"
 *               classId:
 *                 type: string
 *                 description: Class ID
 *                 example: "65bb331b8f9e8a001c9e4a1c"
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *                 example: "65cc441b8f9e8a001c9e4a1d"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Attendance date
 *                 example: "2026-03-07"
 *               attendanceRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - enrollmentId
 *                     - status
 *                   properties:
 *                     enrollmentId:
 *                       type: string
 *                       description: Enrollment ID
 *                       example: "65dd12ab8f9e8a001c9e4a1e"
 *                     studentId:
 *                       type: string
 *                       description: Student ID (for backward compatibility)
 *                       example: "65ee12ab8f9e8a001c9e4a1f"
 *                     status:
 *                       type: string
 *                       enum: [Present, Absent, Leave, Late]
 *                       description: Attendance status
 *                       example: "Present"
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         description: Validation error or bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/mark', authMiddleware, authorizeRoles('school_admin', 'teacher'), validateAttendanceMarking, markAttendance);

/**
 * @swagger
 * /attendance/enrollment/{enrollmentId}:
 *   get:
 *     summary: Get attendance by enrollment
 *     tags: [Enrollment Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for attendance period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for attendance period
 *     responses:
 *       200:
 *         description: Attendance retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/enrollment/:enrollmentId', authMiddleware, authorizeRoles('school_admin', 'teacher', 'parent'), getAttendanceByEnrollment);

/**
 * @swagger
 * /attendance/class-summary:
 *   get:
 *     summary: Get class attendance summary for a specific date
 *     tags: [Enrollment Attendance]
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
 *       - in: query
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Attendance date
 *     responses:
 *       200:
 *         description: Class attendance summary retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/class-summary', authMiddleware, authorizeRoles('school_admin', 'teacher', 'parent'), getClassAttendanceSummary);

/**
 * @swagger
 * /attendance/class-statistics:
 *   get:
 *     summary: Get class attendance statistics over a period
 *     tags: [Enrollment Attendance]
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
 *       - in: query
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Class attendance statistics retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/class-statistics', authMiddleware, authorizeRoles('school_admin', 'teacher'), getClassAttendanceStatistics);

/**
 * @swagger
 * /attendance/dashboard:
 *   get:
 *     summary: Get attendance dashboard data
 *     tags: [Enrollment Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Academic year ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *         description: Section ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Attendance date (defaults to today)
 *     responses:
 *       200:
 *         description: Attendance dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authMiddleware, authorizeRoles('school_admin', 'teacher', 'parent'), getAttendanceDashboard);

// Debug route to test if service loads
router.get('/debug-test', (req, res) => {
  try {
    const service = require('../services/enrollmentAttendanceService');
    res.json({
      success: true,
      message: 'Service loaded successfully',
      serviceMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(service))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Service loading failed',
      error: error.message
    });
  }
});

router.get('/all-enrollments', authMiddleware, authorizeRoles('school_admin', 'teacher'), getAllEnrollmentsForAcademicYear);

module.exports = router;
