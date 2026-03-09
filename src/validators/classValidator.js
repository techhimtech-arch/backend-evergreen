const { check, validationResult } = require('express-validator');

// Validation result handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Create class validation
const validateCreateClass = [
  check('name')
    .notEmpty().withMessage('Class name is required')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Class name must be between 1-100 characters'),
  
  handleValidation,
];

// Update class validation
const validateUpdateClass = [
  check('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Class name must be between 1-100 characters'),
  
  handleValidation,
];

module.exports = { validateCreateClass, validateUpdateClass };
