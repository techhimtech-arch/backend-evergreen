const authService = require('../services/authService');
const logger = require('../utils/logger');

// Helper to get request info
const getRequestInfo = (req) => ({
  ipAddress: req.ip || req.connection?.remoteAddress,
  userAgent: req.headers['user-agent'],
});

// Register School
const registerSchool = async (req, res) => {
  try {
    const result = await authService.registerSchool(req.body);

    res.status(201).json({
      success: true,
      message: 'School registered successfully',
      data: { token: result.token }
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password, getRequestInfo(req));

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        // Legacy support
        token: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// Refresh Token Controller
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const result = await authService.refreshAccessToken(refreshToken, getRequestInfo(req));

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        // Legacy support
        token: result.accessToken,
      },
    });
  } catch (error) {
    logger.error('Token refresh error', { error: error.message });
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Logout Controller
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await authService.logout(refreshToken, getRequestInfo(req));
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Logout from all devices
const logoutAll = async (req, res) => {
  try {
    await authService.logoutAll(req.user.userId, getRequestInfo(req));

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices',
    });
  } catch (error) {
    logger.error('Logout all error', { error: error.message });
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get active sessions
const getActiveSessions = async (req, res) => {
  try {
    const sessions = await authService.getActiveSessions(req.user.userId);

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    logger.error('Get sessions error', { error: error.message });
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Revoke a specific session
const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await authService.revokeSession(sessionId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    logger.error('Revoke session error', { error: error.message });
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Request Password Reset
const requestPasswordReset = async (req, res) => {
  try {
    const result = await authService.requestPasswordReset(req.body.email);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    logger.error('Password reset request error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

module.exports = { 
  registerSchool, 
  login, 
  refreshToken,
  logout,
  logoutAll,
  getActiveSessions,
  revokeSession,
  requestPasswordReset, 
  resetPassword 
};