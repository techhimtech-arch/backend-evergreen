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

const dispatchValidation = [
  body('nurseryId').isMongoId().withMessage('Valid Nursery ID is required'),
  body('requestId').optional().isMongoId(),
  body('receiverId').isMongoId().withMessage('Valid Receiver ID is required'),
  body('plants').isArray({ min: 1 }).withMessage('At least one plant type must be dispatched'),
  body('plants.*.plantTypeId').isMongoId().withMessage('Valid Plant Type ID is required'),
  body('plants.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('remarks').optional().isString(),
  handleValidationErrors
];

const updateStatusValidation = [
  param('id').isMongoId().withMessage('Invalid Dispatch ID'),
  body('status').isIn(["DISPATCHED", "DELIVERED"]).withMessage('Invalid status'),
  body('remarks').optional().isString(),
  handleValidationErrors
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID'),
  handleValidationErrors
];

module.exports = { dispatchValidation, updateStatusValidation, idValidation };
