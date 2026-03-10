const { body, query } = require('express-validator');
const { customValidations } = require('../../middleware/validation.middleware');

const createUserValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value) => {
      if (!customValidations.isStrongPassword(value)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
      return true;
    }),
  
  body('role')
    .isIn(['superadmin', 'school_admin', 'teacher', 'accountant', 'parent', 'student'])
    .withMessage('Invalid role'),
  
  body('schoolId')
    .custom((value) => {
      if (value && !customValidations.isValidObjectId(value)) {
        throw new Error('Invalid school ID');
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .isIn(['superadmin', 'school_admin', 'teacher', 'accountant', 'parent', 'student'])
    .withMessage('Invalid role'),
  
  body('schoolId')
    .optional()
    .custom((value) => {
      if (value && !customValidations.isValidObjectId(value)) {
        throw new Error('Invalid school ID');
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('role')
    .optional()
    .isIn(['superadmin', 'school_admin', 'teacher', 'accountant', 'parent', 'student'])
    .withMessage('Invalid role filter'),
  
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive filter must be a boolean'),
  
  query('schoolId')
    .optional()
    .custom((value) => {
      if (value && !customValidations.isValidObjectId(value)) {
        throw new Error('Invalid school ID');
      }
      return true;
    }),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

const userIdValidation = [
  body('userId')
    .custom((value) => {
      if (!customValidations.isValidObjectId(value)) {
        throw new Error('Invalid user ID');
      }
      return true;
    }),
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  getUsersValidation,
  userIdValidation,
};
