const express = require('express');
const router = express.Router();

const {
  admitStudent,
  getAdmissionDetails,
  getAdmittedStudents,
  getAdmissionFormData,
  validateAdmission
} = require('../controllers/admissionController');

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleAuthorization');

/**
 * @swagger
 * tags:
 *   name: Admission
 *   description: Student admission management routes
 */

/**
 * @swagger
 * /admission/form-data:
 *   get:
 *     summary: Get admission form data
 *     tags: [Admission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admission form data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/form-data', authMiddleware, authorizeRoles('school_admin', 'teacher'), getAdmissionFormData);

/**
 * @swagger
 * /admission:
 *   get:
 *     summary: Get all admitted students list
 *     tags: [Admission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of students per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or admission number
 *     responses:
 *       200:
 *         description: Students list retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, authorizeRoles('school_admin', 'teacher'), getAdmittedStudents);

/**
 * @swagger
 * /admission:
 *   post:
 *     summary: Admit new student
 *     tags: [Admission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - admissionNumber
 *               - gender
 *               - dateOfBirth
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Student's first name
 *                 example: "Rahul"
 *               lastName:
 *                 type: string
 *                 description: Student's last name
 *                 example: "Sharma"
 *               admissionNumber:
 *                 type: string
 *                 description: Unique admission number
 *                 example: "ADM-2026-001"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 description: Student's gender
 *                 example: "Male"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Student's date of birth
 *                 example: "2012-05-10"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Student's email (optional)
 *                 example: "rahul@example.com"
 *               password:
 *                 type: string
 *                 description: Student's password (optional, will use default if not provided)
 *                 example: "TempPassword123"
 *               academicYearId:
 *                 type: string
 *                 description: Academic year ID (optional)
 *                 example: "65aa221b8f9e8a001c9e4a1b"
 *               classId:
 *                 type: string
 *                 description: Class ID (optional)
 *                 example: "65bb331b8f9e8a001c9e4a1c"
 *               sectionId:
 *                 type: string
 *                 description: Section ID (optional)
 *                 example: "65cc441b8f9e8a001c9e4a1d"
 *               rollNumber:
 *                 type: integer
 *                 description: Roll number in section (optional)
 *                 example: 12
 *               parentUserId:
 *                 type: string
 *                 description: Parent user ID (optional)
 *                 example: "65df12ab8f9e8a001c9e4a1e"
 *               address:
 *                 type: string
 *                 description: Student's address (optional)
 *                 example: "123 Main Street, Delhi"
 *               bloodGroup:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *                 description: Blood group (optional)
 *                 example: "O+"
 *               emergencyContact:
 *                 type: string
 *                 description: Emergency contact number (optional)
 *                 example: "+919876543210"
 *     responses:
 *       201:
 *         description: Student admitted successfully
 *       400:
 *         description: Validation error or bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate admission number or email
 */
router.post('/', authMiddleware, authorizeRoles('school_admin'), validateAdmission, admitStudent);

/**
 * @swagger
 * /admission/{studentId}:
 *   get:
 *     summary: Get student admission details
 *     tags: [Admission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student profile ID
 *     responses:
 *       200:
 *         description: Admission details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student not found
 */
router.get('/:studentId', authMiddleware, authorizeRoles('school_admin', 'teacher'), getAdmissionDetails);

module.exports = router;
