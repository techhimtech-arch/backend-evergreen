const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Common validation rules
 */
const commonValidations = {
  // ObjectId validation
  objectId: (fieldName) => param(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isMongoId()
    .withMessage(`Invalid ${fieldName} format`),

  // String validations
  name: (fieldName, minLength = 2, maxLength = 50) => body(fieldName)
    .trim()
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} must be between ${minLength} and ${maxLength} characters`)
    .escape(),

  email: (fieldName = 'email') => body(fieldName)
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  phone: (fieldName = 'phone') => body(fieldName)
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  password: (fieldName = 'password') => body(fieldName)
    .trim()
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Number validations
  positiveNumber: (fieldName, min = 0) => body(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isNumeric()
    .withMessage(`${fieldName} must be a number`)
    .isFloat({ min })
    .withMessage(`${fieldName} must be at least ${min}`),

  // Date validations
  date: (fieldName, future = false) => body(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isISO8601()
    .withMessage(`${fieldName} must be a valid date`)
    .custom((value) => {
      const date = new Date(value);
      if (future && date <= new Date()) {
        throw new Error(`${fieldName} must be in the future`);
      }
      if (!future && date > new Date()) {
        throw new Error(`${fieldName} cannot be in the future`);
      }
      return true;
    }),

  // Enum validations
  enum: (fieldName, allowedValues) => body(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isIn(allowedValues)
    .withMessage(`${fieldName} must be one of: ${allowedValues.join(', ')}`),

  // Array validations
  array: (fieldName, itemValidator, minLength = 0) => body(fieldName)
    .isArray({ min: minLength })
    .withMessage(`${fieldName} must be an array with at least ${minLength} items`)
    .custom((array) => {
      // Validate each item in the array
      for (const item of array) {
        if (typeof item !== 'object' || item === null) {
          throw new Error(`Each item in ${fieldName} must be an object`);
        }
      }
      return true;
    })
};

/**
 * Specific validation chains for different entities
 */
const validations = {
  // User validations
  createUser: [
    commonValidations.name('firstName', 2, 50),
    commonValidations.name('lastName', 2, 50),
    commonValidations.email(),
    commonValidations.password(),
    body('role')
      .isIn(['superadmin', 'school_admin', 'teacher', 'accountant', 'parent', 'student'])
      .withMessage('Invalid role'),
    body('schoolId')
      .optional()
      .isMongoId()
      .withMessage('Invalid school ID format')
  ],

  updateUser: [
    commonValidations.name('firstName', 2, 50),
    commonValidations.name('lastName', 2, 50),
    commonValidations.email(),
    body('role')
      .optional()
      .isIn(['superadmin', 'school_admin', 'teacher', 'accountant', 'parent', 'student'])
      .withMessage('Invalid role')
  ],

  // Student Profile validations
  createStudentProfile: [
    commonValidations.objectId('userId'),
    body('admissionNumber')
      .trim()
      .notEmpty()
      .withMessage('Admission number is required')
      .isLength({ min: 3, max: 20 })
      .withMessage('Admission number must be between 3 and 20 characters')
      .escape(),
    commonValidations.name('firstName', 2, 50),
    commonValidations.name('lastName', 2, 50),
    body('gender')
      .isIn(['Male', 'Female', 'Other'])
      .withMessage('Gender must be Male, Female, or Other'),
    commonValidations.date('dateOfBirth', false),
    body('parentUserId')
      .optional()
      .isMongoId()
      .withMessage('Invalid parent user ID format'),
    commonValidations.objectId('schoolId')
  ],

  // Academic Year validations
  createAcademicYear: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Academic year name is required')
      .isLength({ min: 5, max: 50 })
      .withMessage('Name must be between 5 and 50 characters')
      .escape(),
    body('startDate')
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    body('endDate')
      .isISO8601()
      .withMessage('End date must be a valid date')
      .custom((endDate, { req }) => {
        if (new Date(endDate) <= new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    commonValidations.objectId('schoolId')
  ],

  // Class validations
  createClass: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Class name is required')
      .isLength({ min: 1, max: 50 })
      .withMessage('Class name must be between 1 and 50 characters')
      .escape(),
    commonValidations.objectId('schoolId'),
    commonValidations.objectId('academicYearId')
  ],

  // Section validations
  createSection: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Section name is required')
      .isLength({ min: 1, max: 20 })
      .withMessage('Section name must be between 1 and 20 characters')
      .escape(),
    commonValidations.objectId('classId'),
    commonValidations.objectId('schoolId')
  ],

  // Enrollment validations
  createEnrollment: [
    commonValidations.objectId('studentId'),
    commonValidations.objectId('academicYearId'),
    commonValidations.objectId('classId'),
    commonValidations.objectId('sectionId'),
    body('rollNumber')
      .optional()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Roll number must be between 1 and 20 characters')
      .escape(),
    commonValidations.enum('status', ['enrolled', 'promoted', 'transferred_out', 'completed', 'dropped_out']),
    commonValidations.objectId('schoolId')
  ],

  // Attendance validations
  markAttendance: [
    commonValidations.objectId('examId'),
    commonValidations.objectId('classId'),
    commonValidations.objectId('sectionId'),
    commonValidations.date('date', false),
    body('attendance')
      .isArray({ min: 1 })
      .withMessage('Attendance array is required'),
    body('attendance.*.enrollmentId')
      .notEmpty()
      .withMessage('Enrollment ID is required for each attendance record')
      .isMongoId()
      .withMessage('Invalid enrollment ID format'),
    body('attendance.*.status')
      .isIn(['present', 'absent', 'late', 'leave'])
      .withMessage('Status must be present, absent, late, or leave')
  ],

  // Fee Structure validations
  createFeeStructure: [
    commonValidations.objectId('academicYearId'),
    commonValidations.objectId('classId'),
    commonValidations.enum('feeType', ['tuition', 'transport', 'admission', 'exam', 'library', 'laboratory', 'sports', 'other']),
    body('feeName')
      .trim()
      .notEmpty()
      .withMessage('Fee name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Fee name must be between 2 and 100 characters')
      .escape(),
    commonValidations.positiveNumber('amount', 0),
    commonValidations.date('dueDate', true),
    body('lateFee')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Late fee must be a non-negative number'),
    body('concessionPercentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Concession percentage must be between 0 and 100'),
    commonValidations.objectId('schoolId')
  ],

  // Payment validations
  processPayment: [
    commonValidations.objectId('feeId'),
    commonValidations.positiveNumber('amount', 0.01),
    commonValidations.enum('paymentMethod', ['cash', 'cheque', 'bank_transfer', 'online', 'card', 'upi']),
    body('transactionId')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Transaction ID must not exceed 100 characters')
      .escape(),
    body('remarks')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Remarks must not exceed 500 characters')
      .escape()
  ],

  // Result validations
  saveMarks: [
    commonValidations.objectId('examId'),
    commonValidations.objectId('classId'),
    commonValidations.objectId('sectionId'),
    body('students')
      .isArray({ min: 1 })
      .withMessage('Students array is required'),
    body('students.*.enrollmentId')
      .notEmpty()
      .withMessage('Enrollment ID is required for each student')
      .isMongoId()
      .withMessage('Invalid enrollment ID format'),
    body('students.*.subjects')
      .isArray({ min: 1 })
      .withMessage('Subjects array is required for each student'),
    body('students.*.subjects.*.subjectId')
      .notEmpty()
      .withMessage('Subject ID is required for each subject')
      .isMongoId()
      .withMessage('Invalid subject ID format'),
    body('students.*.subjects.*.marksObtained')
      .isFloat({ min: 0 })
      .withMessage('Marks obtained must be a non-negative number'),
    body('students.*.subjects.*.maxMarks')
      .isFloat({ min: 1 })
      .withMessage('Max marks must be at least 1'),
    body('students.*.subjects.*.remarks')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Subject remarks must not exceed 500 characters')
      .escape()
  ],

  // Query parameter validations
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search term must not exceed 100 characters')
      .escape()
  ],

  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
      .custom((endDate, { req }) => {
        if (req.query.startDate && new Date(endDate) <= new Date(req.query.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
  ],

  // Announcement validations
  createAnnouncement: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Announcement title is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters')
      .escape(),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Announcement content is required')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Content must be between 10 and 5000 characters')
      .escape(),
    body('type')
      .optional()
      .isIn(['general', 'academic', 'sports', 'events', 'emergency', 'examination', 'holiday'])
      .withMessage('Invalid announcement type'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority level'),
    body('targetAudience')
      .isArray({ min: 1 })
      .withMessage('Target audience is required and must be an array'),
    body('targetAudience.*')
      .isIn(['all', 'students', 'teachers', 'parents', 'admin', 'specific_classes', 'specific_sections'])
      .withMessage('Invalid target audience option'),
    body('targetClasses')
      .optional()
      .isArray()
      .withMessage('Target classes must be an array'),
    body('targetClasses.*.classId')
      .optional()
      .isMongoId()
      .withMessage('Invalid class ID format'),
    body('targetSections')
      .optional()
      .isArray()
      .withMessage('Target sections must be an array'),
    body('targetSections.*.sectionId')
      .optional()
      .isMongoId()
      .withMessage('Invalid section ID format'),
    body('targetUsers')
      .optional()
      .isArray()
      .withMessage('Target users must be an array'),
    body('targetUsers.*.userId')
      .optional()
      .isMongoId()
      .withMessage('Invalid user ID format'),
    body('expiryDate')
      .optional()
      .isISO8601()
      .withMessage('Expiry date must be a valid date')
      .custom((value) => {
        if (value && new Date(value) <= new Date()) {
          throw new Error('Expiry date must be in the future');
        }
        return true;
      }),
    body('scheduledDate')
      .optional()
      .isISO8601()
      .withMessage('Scheduled date must be a valid date')
      .custom((value) => {
        if (value && new Date(value) <= new Date()) {
          throw new Error('Scheduled date must be in the future');
        }
        return true;
      }),
    body('deliveryMethods.email')
      .optional()
      .isBoolean()
      .withMessage('Email delivery method must be boolean'),
    body('deliveryMethods.sms')
      .optional()
      .isBoolean()
      .withMessage('SMS delivery method must be boolean'),
    body('deliveryMethods.push')
      .optional()
      .isBoolean()
      .withMessage('Push delivery method must be boolean'),
    body('deliveryMethods.dashboard')
      .optional()
      .isBoolean()
      .withMessage('Dashboard delivery method must be boolean'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 30 })
      .withMessage('Each tag must be between 1 and 30 characters')
      .escape(),
    body('allowComments')
      .optional()
      .isBoolean()
      .withMessage('Allow comments must be boolean'),
    body('isPinned')
      .optional()
      .isBoolean()
      .withMessage('Is pinned must be boolean')
  ],

  updateAnnouncement: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters')
      .escape(),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Content must be between 10 and 5000 characters')
      .escape(),
    body('type')
      .optional()
      .isIn(['general', 'academic', 'sports', 'events', 'emergency', 'examination', 'holiday'])
      .withMessage('Invalid announcement type'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority level'),
    body('targetAudience')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Target audience must be an array with at least 1 item'),
    body('expiryDate')
      .optional()
      .isISO8601()
      .withMessage('Expiry date must be a valid date'),
    body('scheduledDate')
      .optional()
      .isISO8601()
      .withMessage('Scheduled date must be a valid date'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('allowComments')
      .optional()
      .isBoolean()
      .withMessage('Allow comments must be boolean'),
    body('isPinned')
      .optional()
      .isBoolean()
      .withMessage('Is pinned must be boolean')
  ],

  addComment: [
    body('comment')
      .trim()
      .notEmpty()
      .withMessage('Comment is required')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comment must be between 1 and 1000 characters')
      .escape()
  ]
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  validations,
  validateAnnouncement: [validations.createAnnouncement, handleValidationErrors],
  validateAnnouncementUpdate: [validations.updateAnnouncement, handleValidationErrors],
  validateComment: [validations.addComment, handleValidationErrors]
};
