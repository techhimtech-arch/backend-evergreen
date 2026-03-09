const { check, validationResult } = require('express-validator');

// Validation result handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Create teacher assignment validation
const validateCreateAssignment = [
  check('teacherId')
    .notEmpty().withMessage('Teacher ID is required')
    .isMongoId().withMessage('Invalid Teacher ID format'),
  
  check('classId')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid Class ID format'),
  
  check('sectionId')
    .notEmpty().withMessage('Section ID is required')
    .isMongoId().withMessage('Invalid Section ID format'),
  
  check('subjectId')
    .notEmpty().withMessage('Subject ID is required')
    .isMongoId().withMessage('Invalid Subject ID format'),
  
  handleValidation,
];

// Update teacher assignment validation
const validateUpdateAssignment = [
  check('teacherId')
    .optional()
    .isMongoId().withMessage('Invalid Teacher ID format'),
  
  check('classId')
    .optional()
    .isMongoId().withMessage('Invalid Class ID format'),
  
  check('sectionId')
    .optional()
    .isMongoId().withMessage('Invalid Section ID format'),
  
  check('subjectId')
    .optional()
    .isMongoId().withMessage('Invalid Subject ID format'),
  
  handleValidation,
];

module.exports = { validateCreateAssignment, validateUpdateAssignment };
