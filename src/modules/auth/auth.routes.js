const express = require('express');
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  logoutValidation,
  passwordResetRequestValidation,
  passwordResetValidation,
  changePasswordValidation,
} = require('./auth.validation');
const { body } = require('express-validator');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', refreshTokenValidation, validate, authController.refreshToken);
router.post('/logout', logoutValidation, validate, authController.logout);
router.post('/password-reset-request', passwordResetRequestValidation, validate, authController.requestPasswordReset);
router.post('/password-reset', passwordResetValidation, validate, authController.resetPassword);

// Protected routes (authentication required)
router.use(authenticate); // Apply authentication to all following routes

router.get('/profile', authController.getProfile);
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  validate
], authController.updateProfile);

router.post('/change-password', changePasswordValidation, validate, authController.changePassword);
router.post('/logout-all', authController.logoutAll);
router.get('/sessions', authController.getActiveSessions);
router.delete('/sessions/:sessionId', authController.revokeSession);

module.exports = router;
