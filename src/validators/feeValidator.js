const { check, validationResult } = require('express-validator');

// Validation result handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Create fee structure validation
const validateCreateFeeStructure = [
  check('classId')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid Class ID format'),
  
  check('academicYear')
    .notEmpty().withMessage('Academic year is required')
    .trim()
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY (e.g., 2024-2025)'),
  
  check('tuitionFee')
    .notEmpty().withMessage('Tuition fee is required')
    .isFloat({ min: 0 }).withMessage('Tuition fee must be a positive number'),
  
  check('transportFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Transport fee must be a positive number'),
  
  check('examFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Exam fee must be a positive number'),
  
  check('otherCharges')
    .optional()
    .isFloat({ min: 0 }).withMessage('Other charges must be a positive number'),
  
  handleValidation,
];

// Update fee structure validation
const validateUpdateFeeStructure = [
  check('tuitionFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Tuition fee must be a positive number'),
  
  check('transportFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Transport fee must be a positive number'),
  
  check('examFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Exam fee must be a positive number'),
  
  check('otherCharges')
    .optional()
    .isFloat({ min: 0 }).withMessage('Other charges must be a positive number'),
  
  handleValidation,
];

// Record fee payment validation
const validateFeePayment = [
  check('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid Student ID format'),
  
  check('feeStructureId')
    .notEmpty().withMessage('Fee Structure ID is required')
    .isMongoId().withMessage('Invalid Fee Structure ID format'),
  
  check('amountPaid')
    .notEmpty().withMessage('Amount paid is required')
    .isFloat({ min: 0.01 }).withMessage('Amount paid must be greater than 0'),
  
  check('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'upi', 'bank_transfer', 'cheque']).withMessage('Invalid payment method'),
  
  check('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Transaction ID must not exceed 100 characters'),
  
  check('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Remarks must not exceed 500 characters'),
  
  handleValidation,
];

module.exports = { 
  validateCreateFeeStructure, 
  validateUpdateFeeStructure, 
  validateFeePayment 
};
