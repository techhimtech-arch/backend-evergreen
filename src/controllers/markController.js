const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const markService = require('../services/markService');
const logger = require('../utils/logger');

// Validation middleware for mark entry
const validateMarkEntry = [
  body('examId')
    .notEmpty()
    .withMessage('Exam ID is required')
    .isMongoId()
    .withMessage('Invalid exam ID'),
  
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Invalid class ID'),
  
  body('sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Invalid section ID'),
  
  body('students')
    .isArray({ min: 1 })
    .withMessage('Students array is required'),
  
  body('students.*.enrollmentId')
    .notEmpty()
    .withMessage('Enrollment ID is required')
    .isMongoId()
    .withMessage('Invalid enrollment ID'),
  
  body('students.*.subjects')
    .isArray({ min: 1 })
    .withMessage('Subjects array is required'),
  
  body('students.*.subjects.*.subjectId')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isMongoId()
    .withMessage('Invalid subject ID'),
  
  body('students.*.subjects.*.marksObtained')
    .isNumeric()
    .withMessage('Marks obtained must be a number')
    .isFloat({ min: 0 })
    .withMessage('Marks obtained cannot be negative'),
  
  body('students.*.subjects.*.maxMarks')
    .isNumeric()
    .withMessage('Max marks must be a number')
    .isFloat({ min: 1 })
    .withMessage('Max marks must be at least 1')
];

// Get students for mark entry
const getStudentsForMarkEntry = asyncHandler(async (req, res) => {
  const { examId, classId, sectionId } = req.query;
  const { schoolId } = req.user;

  if (!examId || !classId || !sectionId) {
    return res.status(400).json({
      success: false,
      message: 'Exam ID, Class ID, and Section ID are required'
    });
  }

  const result = await markService.getStudentsForMarkEntry(
    examId,
    classId,
    sectionId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Save marks for multiple students
const saveMarks = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const marksData = {
    ...req.body,
    enteredBy: req.user._id
  };

  const result = await markService.saveMarks(
    marksData,
    req.user._id,
    req.user.schoolId
  );

  res.status(result.success ? 201 : 400).json(result);
});

// Get student results for an exam
const getStudentExamResults = asyncHandler(async (req, res) => {
  const { enrollmentId, examId } = req.params;
  const { schoolId } = req.user;

  const result = await markService.getStudentExamResults(
    enrollmentId,
    examId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get class results for an exam
const getClassExamResults = asyncHandler(async (req, res) => {
  const { examId, classId, sectionId } = req.query;
  const { schoolId } = req.user;

  if (!examId || !classId || !sectionId) {
    return res.status(400).json({
      success: false,
      message: 'Exam ID, Class ID, and Section ID are required'
    });
  }

  const result = await markService.getClassExamResults(
    classId,
    sectionId,
    examId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get class exam statistics
const getClassExamStatistics = asyncHandler(async (req, res) => {
  const { examId, classId, sectionId } = req.query;
  const { schoolId } = req.user;

  if (!examId || !classId || !sectionId) {
    return res.status(400).json({
      success: false,
      message: 'Exam ID, Class ID, and Section ID are required'
    });
  }

  const result = await markService.getClassExamStatistics(
    classId,
    sectionId,
    examId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get subject-wise performance
const getSubjectPerformance = asyncHandler(async (req, res) => {
  const { examId, classId, sectionId } = req.query;
  const { schoolId } = req.user;

  if (!examId || !classId || !sectionId) {
    return res.status(400).json({
      success: false,
      message: 'Exam ID, Class ID, and Section ID are required'
    });
  }

  const result = await markService.getSubjectPerformance(
    classId,
    sectionId,
    examId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Submit results for verification
const submitResults = asyncHandler(async (req, res) => {
  const { examId, classId, sectionId } = req.body;
  const { schoolId, _id: submittedBy } = req.user;

  if (!examId || !classId || !sectionId) {
    return res.status(400).json({
      success: false,
      message: 'Exam ID, Class ID, and Section ID are required'
    });
  }

  const result = await markService.submitResults(
    examId,
    classId,
    sectionId,
    schoolId,
    submittedBy
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Verify results
const verifyResults = asyncHandler(async (req, res) => {
  const { examId, classId, sectionId } = req.body;
  const { schoolId, _id: verifiedBy } = req.user;

  if (!examId || !classId || !sectionId) {
    return res.status(400).json({
      success: false,
      message: 'Exam ID, Class ID, and Section ID are required'
    });
  }

  const result = await markService.verifyResults(
    examId,
    classId,
    sectionId,
    schoolId,
    verifiedBy
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Publish results
const publishResults = asyncHandler(async (req, res) => {
  const { examId, classId, sectionId } = req.body;
  const { schoolId, _id: publishedBy } = req.user;

  if (!examId || !classId || !sectionId) {
    return res.status(400).json({
      success: false,
      message: 'Exam ID, Class ID, and Section ID are required'
    });
  }

  const result = await markService.publishResults(
    examId,
    classId,
    sectionId,
    schoolId,
    publishedBy
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get student's complete academic record
const getStudentAcademicRecord = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { schoolId } = req.user;

  const result = await markService.getStudentAcademicRecord(
    enrollmentId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get mark entry dashboard
const getMarkEntryDashboard = asyncHandler(async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { examId, classId, sectionId } = req.query;

    let dashboardData = {};
    
    if (examId && classId && sectionId) {
      // Get specific exam data
      const [studentsData, statistics] = await Promise.all([
        markService.getStudentsForMarkEntry(examId, classId, sectionId, schoolId),
        markService.getClassExamStatistics(classId, sectionId, examId, schoolId)
      ]);
      
      dashboardData = {
        studentsData: studentsData.data,
        statistics: statistics.data
      };
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    logger.error('Failed to get mark entry dashboard', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get mark entry dashboard'
    });
  }
});

module.exports = {
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
};
