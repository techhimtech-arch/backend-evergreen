const express = require('express');
const router = express.Router();

const {
  getStudentsForMarkEntry,
  saveMarks,
  getStudentExamResults,
  getClassExamResults,
  getClassExamStatistics,
  getSubjectPerformance,
  submitResults,
  verifyResults,
  publishResults,
  getStudentAcademicRecord,
  getMarkEntryDashboard,
  validateMarkEntry
} = require('../controllers/markController');

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleAuthorization');

/**
 * @swagger
 * tags:
 *   name: Marks & Results
 *   description: Enrollment-based marks and results management
 */

/**
 * @swagger
 * /marks/students:
 *   get:
 *     summary: Get students for mark entry
 *     tags: [Marks & Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
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
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/students', authMiddleware, authorizeRoles('school_admin', 'teacher'), getStudentsForMarkEntry);

/**
 * @swagger
 * /marks/save:
 *   post:
 *     summary: Save marks for multiple students
 *     tags: [Marks & Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - classId
 *               - sectionId
 *               - students
 *             properties:
 *               examId:
 *                 type: string
 *                 description: Exam ID
 *                 example: "65aa221b8f9e8a001c9e4a1b"
 *               classId:
 *                 type: string
 *                 description: Class ID
 *                 example: "65bb331b8f9e8a001c9e4a1c"
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *                 example: "65cc441b8f9e8a001c9e4a1d"
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - enrollmentId
 *                     - subjects
 *                   properties:
 *                     enrollmentId:
 *                       type: string
 *                       description: Enrollment ID
 *                       example: "65dd12ab8f9e8a001c9e4a1e"
 *                     subjects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - subjectId
 *                           - marksObtained
 *                           - maxMarks
 *                         properties:
 *                           subjectId:
 *                             type: string
 *                             description: Subject ID
 *                             example: "65ee12ab8f9e8a001c9e4a1f"
 *                           marksObtained:
 *                             type: number
 *                             description: Marks obtained
 *                             example: 85
 *                           maxMarks:
 *                             type: number
 *                             description: Maximum marks
 *                             example: 100
 *                           remarks:
 *                             type: string
 *                             description: Subject remarks
 *                             example: "Good performance"
 *                     status:
 *                       type: string
 *                       enum: [draft, submitted, verified, published]
 *                       description: Result status
 *                       example: "draft"
 *     responses:
 *       201:
 *         description: Marks saved successfully
 *       400:
 *         description: Validation error or bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/save', authMiddleware, authorizeRoles('school_admin', 'teacher'), validateMarkEntry, saveMarks);

/**
 * @swagger
 * /marks/student/{enrollmentId}/exam/{examId}:
 *   get:
 *     summary: Get student results for an exam
 *     tags: [Marks & Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Student results retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/student/:enrollmentId/exam/:examId', authMiddleware, authorizeRoles('school_admin', 'teacher', 'parent', 'student'), getStudentExamResults);

/**
 * @swagger
 * /marks/class-results:
 *   get:
 *     summary: Get class results for an exam
 *     tags: [Marks & Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
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
 *     responses:
 *       200:
 *         description: Class results retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/class-results', authMiddleware, authorizeRoles('school_admin', 'teacher'), getClassExamResults);

/**
 * @swagger
 * /marks/class-statistics:
 *   get:
 *     summary: Get class exam statistics
 *     tags: [Marks & Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
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
 *     responses:
 *       200:
 *         description: Class statistics retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/class-statistics', authMiddleware, authorizeRoles('school_admin', 'teacher'), getClassExamStatistics);

/**
 * @swagger
 * /marks/subject-performance:
 *   get:
 *     summary: Get subject-wise performance for a class
 *     tags: [Marks & Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
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
 *     responses:
 *       200:
 *         description: Subject performance retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/subject-performance', authMiddleware, authorizeRoles('school_admin', 'teacher'), getSubjectPerformance);

/**
 * @swagger
 * /marks/submit:
 *   post:
 *     summary: Submit results for verification
 *     tags: [Marks & Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - classId
 *               - sectionId
 *             properties:
 *               examId:
 *                 type: string
 *                 description: Exam ID
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *     responses:
 *       200:
 *         description: Results submitted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/submit', authMiddleware, authorizeRoles('school_admin', 'teacher'), submitResults);

/**
 * @swagger
 * /marks/verify:
 *   post:
 *     summary: Verify results
 *     tags: [Marks & Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - classId
 *               - sectionId
 *             properties:
 *               examId:
 *                 type: string
 *                 description: Exam ID
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *     responses:
 *       200:
 *         description: Results verified successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/verify', authMiddleware, authorizeRoles('school_admin'), verifyResults);

/**
 * @swagger
 * /marks/publish:
 *   post:
 *     summary: Publish results
 *     tags: [Marks & Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - classId
 *               - sectionId
 *             properties:
 *               examId:
 *                 type: string
 *                 description: Exam ID
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *     responses:
 *       200:
 *         description: Results published successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/publish', authMiddleware, authorizeRoles('school_admin'), publishResults);

/**
 * @swagger
 * /marks/student/{enrollmentId}/academic-record:
 *   get:
 *     summary: Get student's complete academic record
 *     tags: [Marks & Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Academic record retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/student/:enrollmentId/academic-record', authMiddleware, authorizeRoles('school_admin', 'teacher', 'parent', 'student'), getStudentAcademicRecord);

/**
 * @swagger
 * /marks/dashboard:
 *   get:
 *     summary: Get mark entry dashboard data
 *     tags: [Marks & Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examId
 *         schema:
 *           type: string
 *         description: Exam ID
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
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authMiddleware, authorizeRoles('school_admin', 'teacher'), getMarkEntryDashboard);

module.exports = router;
