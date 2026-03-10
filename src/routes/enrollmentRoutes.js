const express = require('express');
const router = express.Router();

const {
  enrollStudent,
  getCurrentEnrollment,
  getStudentHistory,
  promoteStudent,
  getClassEnrollments,
  bulkEnrollStudents,
  validateEnrollment,
  validatePromotion,
} = require('../controllers/enrollmentController');

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleAuthorization');

// Apply protection to all routes
router.use(protect);

// POST /api/v1/enrollments - Enroll student
router.post('/', authorizeRoles('school_admin', 'teacher'), validateEnrollment, enrollStudent);

// GET /api/v1/enrollments/student/:studentId/current - Get current enrollment
router.get('/student/:studentId/current', getCurrentEnrollment);

// GET /api/v1/enrollments/student/:studentId/history - Get enrollment history
router.get('/student/:studentId/history', getStudentHistory);

// POST /api/v1/enrollments/promote - Promote student
router.post('/promote', authorizeRoles('school_admin'), validatePromotion, promoteStudent);

// GET /api/v1/enrollments/class - Get class enrollments
router.get('/class', getClassEnrollments);

// POST /api/v1/enrollments/bulk - Bulk enroll students
router.post('/bulk', authorizeRoles('school_admin'), bulkEnrollStudents);

module.exports = router;
