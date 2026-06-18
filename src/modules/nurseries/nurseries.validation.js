const { body, param, validationResult } = require('express-validator');

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
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Nursery name must be between 2 and 150 characters'),
  body('organizationId').isMongoId().withMessage('Valid Organization ID is required'),
  body('managerId').isMongoId().withMessage('Valid Manager ID is required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.district').notEmpty().withMessage('District is required'),
  body('location.latitude').optional().isNumeric(),
  body('location.longitude').optional().isNumeric(),
  handleValidationErrors
];

const updateStockValidation = [
  param('id').isMongoId().withMessage('Invalid Nursery ID'),
  body('plantTypeId').isMongoId().withMessage('Valid Plant Type ID is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be zero or positive integer'),
  handleValidationErrors
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID'),
  handleValidationErrors
];

module.exports = { createValidation, updateStockValidation, idValidation };
