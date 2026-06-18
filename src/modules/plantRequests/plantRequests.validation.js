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

const createRequestValidation = [
  body('organizationId').isMongoId().withMessage('Valid Organization ID is required'),
  body('groupId').optional().isMongoId(),
  body('requestedSpecies').isArray({ min: 1 }).withMessage('At least one plant species is required'),
  body('requestedSpecies.*.plantTypeId').isMongoId().withMessage('Valid Plant Type ID is required'),
  body('requestedSpecies.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('purpose').optional().isString(),
  body('location').optional().isString(),
  handleValidationErrors
];

const updateStatusValidation = [
  param('id').isMongoId().withMessage('Invalid Request ID'),
  body('status').isIn(["PENDING", "APPROVED", "PARTIALLY_FULFILLED", "FULFILLED", "REJECTED"]).withMessage('Invalid status'),
  body('remarks').optional().isString(),
  handleValidationErrors
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID'),
  handleValidationErrors
];

module.exports = { createRequestValidation, updateStatusValidation, idValidation };
