const { body } = require('express-validator');
const { customValidations } = require('../../middleware/validation.middleware');

const registerValidation = [
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
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

const logoutValidation = [
  body('refreshToken')
    .optional()
    .notEmpty()
    .withMessage('Refresh token must not be empty if provided'),
];

const passwordResetRequestValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
];

const passwordResetValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value) => {
      if (!customValidations.isStrongPassword(value)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
      return true;
    }),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value) => {
      if (!customValidations.isStrongPassword(value)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
      return true;
    }),
];

module.exports = {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  logoutValidation,
  passwordResetRequestValidation,
  passwordResetValidation,
  changePasswordValidation,
};
