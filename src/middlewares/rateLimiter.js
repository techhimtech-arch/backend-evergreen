/**
 * Rate Limiting Middleware
 * Protects API from brute-force attacks and abuse
 */

const rateLimit = require('express-rate-limit');

/**
 * Global Rate Limiter
 * Applies to all routes
 * 100 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Auth Route Rate Limiter
 * Stricter limits for authentication endpoints
 * 10 requests per 15 minutes per IP
 * Protects against brute-force password attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
  skipSuccessfulRequests: false, // Count all requests, not just failed ones
});

module.exports = {
  globalLimiter,
  authLimiter,
};
