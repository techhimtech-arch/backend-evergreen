const express = require('express');
const {
  markAttendance,
  bulkMarkAttendance,
  getAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');
const { check, validationResult } = require('express-validator');

// Validation middleware helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management APIs
 */

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Mark attendance for a single student
 *     description: |
 *       Role-based access:
 *       - superadmin/school_admin: Allowed without restriction
 *       - teacher: Must have active TeacherAssignment for the class/section/subject
 *       - Others: Not allowed
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - classId
 *               - sectionId
 *               - subjectId
 *               - date
 *               - status
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student's ObjectId
 *               classId:
 *                 type: string
 *                 description: Class ObjectId
 *               sectionId:
 *                 type: string
 *                 description: Section ObjectId
 *               subjectId:
 *                 type: string
 *                 description: Subject ObjectId (required for teacher assignment verification)
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Present, Absent, Leave]
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         description: Duplicate attendance or bad request
 *       403:
 *         description: Not authorized (teacher not assigned to this subject)
 */

/**
 * @swagger
 * /attendance/bulk:
 *   post:
 *     summary: Mark attendance for multiple students in bulk
 *     description: |
 *       Role-based access:
 *       - superadmin/school_admin: Allowed without restriction
 *       - teacher: Must have active TeacherAssignment for the class/section/subject
 *       - Others: Not allowed
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - classId
 *               - sectionId
 *               - subjectId
 *               - records
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               classId:
 *                 type: string
 *                 description: Class ObjectId
 *               sectionId:
 *                 type: string
 *                 description: Section ObjectId
 *               subjectId:
 *                 type: string
 *                 description: Subject ObjectId (required for teacher assignment verification)
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - status
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Present, Absent, Leave]
 *     responses:
 *       201:
 *         description: Bulk attendance marked successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Not authorized (teacher not assigned to this subject)
 */

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Get attendance records
 *     description: |
 *       Role-based access:
 *       - superadmin/school_admin/teacher: Can filter by classId, sectionId, studentId
 *       - parent: Automatically filtered to only show their own children's attendance (query params ignored)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by class (ignored for parent role)
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *         description: Filter by section (ignored for parent role)
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student (ignored for parent role)
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /attendance/{id}:
 *   delete:
 *     summary: Delete an attendance record
 *     tags: [Attendance]
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
 *         description: Attendance record deleted successfully
 *       404:
 *         description: Attendance record not found
 */

// Apply authentication middleware
router.use(protect);

// Routes with specific role authorization
// POST routes - only admin/teacher
router.post(
  '/',
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  [
    check('studentId', 'Student ID is required').notEmpty().isMongoId(),
    check('classId', 'Class ID is required').notEmpty().isMongoId(),
    check('sectionId', 'Section ID is required').notEmpty().isMongoId(),
    check('subjectId', 'Subject ID is required').notEmpty().isMongoId(),
    check('date', 'Date is required').notEmpty().isISO8601(),
    check('status', 'Status must be Present, Absent, or Leave').isIn(['Present', 'Absent', 'Leave']),
  ],
  validate,
  markAttendance
);

router.post(
  '/bulk',
  authorizeRoles('superadmin', 'school_admin', 'teacher'),
  [
    check('classId', 'Class ID is required').notEmpty().isMongoId(),
    check('sectionId', 'Section ID is required').notEmpty().isMongoId(),
    check('subjectId', 'Subject ID is required').notEmpty().isMongoId(),
    check('date', 'Date is required').notEmpty().isISO8601(),
    check('records', 'Records array is required').isArray({ min: 1 }),
    check('records.*.studentId', 'Each record must have a valid studentId').isMongoId(),
    check('records.*.status', 'Each record status must be Present, Absent, or Leave').isIn(['Present', 'Absent', 'Leave']),
  ],
  validate,
  bulkMarkAttendance
);

// GET routes - allow parent for their own children
router.get('/', authorizeRoles('superadmin', 'school_admin', 'teacher', 'parent'), getAttendance);

// DELETE routes - only admin/teacher
router.delete('/:id', authorizeRoles('superadmin', 'school_admin', 'teacher'), deleteAttendance);

module.exports = router;