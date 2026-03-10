const express = require('express');
const { 
  registerSchool, 
  login, 
  refreshToken,
  logout,
  logoutAll,
  getActiveSessions,
  revokeSession,
  requestPasswordReset, 
  resetPassword 
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const router = express.Router();
const User = require('../models/User');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization routes
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new school with admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolName
 *               - schoolEmail
 *               - adminName
 *               - adminEmail
 *               - adminPassword
 *             properties:
 *               schoolName:
 *                 type: string
 *                 description: Name of the school
 *                 example: Delhi Public School
 *               schoolEmail:
 *                 type: string
 *                 description: School's official email
 *                 example: contact@dps.edu
 *               adminName:
 *                 type: string
 *                 description: Name of the school admin
 *                 example: John Doe
 *               adminEmail:
 *                 type: string
 *                 description: Admin's login email
 *                 example: admin@dps.edu
 *               adminPassword:
 *                 type: string
 *                 description: Admin's password (min 6 characters)
 *                 example: password123
 *     responses:
 *       201:
 *         description: School registered successfully
 *       400:
 *         description: School already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */

// Register School Route
router.post('/register', validateRegister, registerSchool);

// Login Route
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token received during login
 *     responses:
 *       200:
 *         description: New access and refresh tokens
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout (revoke refresh token)
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 *       401:
 *         description: Unauthorized
 */
router.post('/logout-all', authMiddleware, logoutAll);

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: Get active sessions
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active sessions
 *       401:
 *         description: Unauthorized
 */
router.get('/sessions', authMiddleware, getActiveSessions);

/**
 * @swagger
 * /auth/sessions/{sessionId}:
 *   delete:
 *     summary: Revoke a specific session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session revoked
 *       404:
 *         description: Session not found
 */
router.delete('/sessions/:sessionId', authMiddleware, revokeSession);

// Protected Test Route
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
