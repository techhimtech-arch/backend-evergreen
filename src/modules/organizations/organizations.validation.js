const { body, query, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const createValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('slug').trim().isLength({ min: 2, max: 100 }).withMessage('Slug is required'),
  body('organizationType').isIn(['GOVERNMENT', 'NGO', 'SCHOOL', 'CSR']).withMessage('Invalid organization type'),
  body('contactEmail').optional().isEmail().withMessage('Valid email is required'),
  body('contactPhone').optional().isString(),
  handleValidationErrors
];

const updateValidation = [
  param('id').isMongoId().withMessage('Invalid ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('organizationType').optional().isIn(['GOVERNMENT', 'NGO', 'SCHOOL', 'CSR']),
  body('contactEmail').optional().isEmail(),
  handleValidationErrors
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID'),
  handleValidationErrors
];

module.exports = { createValidation, updateValidation, idValidation };
