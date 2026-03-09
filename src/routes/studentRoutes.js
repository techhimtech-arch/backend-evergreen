const express = require('express');
const { createStudent, getStudents, getStudentById, updateStudent, deleteStudent, bulkImportStudents, getImportTemplate } = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');
const { validateCreateStudent, validateUpdateStudent } = require('../validators/studentValidator');
const { handleCSVUpload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management routes
 */

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Add a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admissionNumber:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               classId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               parentName:
 *                 type: string
 *               parentPhone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student added successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  authMiddleware,
  authorizeRoles('school_admin', 'teacher'),
  validateCreateStudent,
  createStudent
);

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students for the logged-in user's school
 *     description: |
 *       Role-based access:
 *       - superadmin/school_admin/teacher: Returns all students in school
 *       - parent: Returns only their own children (filtered by parentUserId)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of students per page (max 100)
 *     responses:
 *       200:
 *         description: List of students
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, getStudents);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a single student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student details
 *       404:
 *         description: Student not found
 */
router.get('/:id', authMiddleware, getStudentById);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               classId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               parentName:
 *                 type: string
 *               parentPhone:
 *                 type: string
 *               address:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       404:
 *         description: Student not found
 */
router.put('/:id', authMiddleware, authorizeRoles('school_admin'), validateUpdateStudent, updateStudent);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Soft delete a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 */
router.delete('/:id', authMiddleware, authorizeRoles('school_admin'), deleteStudent);

/**
 * @swagger
 * /students/import/template:
 *   get:
 *     summary: Download CSV template for bulk import
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV template file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/import/template', authMiddleware, authorizeRoles('school_admin'), getImportTemplate);

/**
 * @swagger
 * /students/import/bulk:
 *   post:
 *     summary: Bulk import students from CSV
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file with student data
 *     responses:
 *       200:
 *         description: Import completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: array
 *                     failed:
 *                       type: array
 *       400:
 *         description: Invalid CSV or validation errors
 */
router.post('/import/bulk', authMiddleware, authorizeRoles('school_admin'), handleCSVUpload, bulkImportStudents);

module.exports = router;