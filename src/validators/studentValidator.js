const { check, validationResult } = require('express-validator');

// Validation result handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Create student validation
const validateCreateStudent = [
  check('admissionNumber')
    .notEmpty().withMessage('Admission number is required')
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Admission number must be between 1-50 characters'),
  
  check('firstName')
    .notEmpty().withMessage('First name is required')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1-100 characters'),
  
  check('lastName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Last name must not exceed 100 characters'),
  
  check('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  
  check('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Invalid date format for date of birth'),
  
  check('classId')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid Class ID format'),
  
  check('sectionId')
    .notEmpty().withMessage('Section ID is required')
    .isMongoId().withMessage('Invalid Section ID format'),
  
  check('parentName')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Parent name must not exceed 200 characters'),
  
  check('parentPhone')
    .optional()
    .trim()
    .matches(/^[0-9]{10,15}$/).withMessage('Invalid phone number (10-15 digits)'),
  
  check('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  
  handleValidation,
];

// Update student validation
const validateUpdateStudent = [
  check('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1-100 characters'),
  
  check('lastName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Last name must not exceed 100 characters'),
  
  check('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  
  check('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Invalid date format for date of birth'),
  
  check('classId')
    .optional()
    .isMongoId().withMessage('Invalid Class ID format'),
  
  check('sectionId')
    .optional()
    .isMongoId().withMessage('Invalid Section ID format'),
  
  check('parentName')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Parent name must not exceed 200 characters'),
  
  check('parentPhone')
    .optional()
    .trim()
    .matches(/^[0-9]{10,15}$/).withMessage('Invalid phone number (10-15 digits)'),
  
  check('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  
  check('rollNumber')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Roll number must not exceed 20 characters'),
  
  handleValidation,
];

module.exports = { validateCreateStudent, validateUpdateStudent };
