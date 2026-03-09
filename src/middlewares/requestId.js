const crypto = require('crypto');

/**
 * Request ID Middleware
 * Generates a unique UUID for each incoming request for tracking
 */
const requestIdMiddleware = (req, res, next) => {
  // Use existing request ID from header or generate new one
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  
  // Attach to request object
  req.requestId = requestId;
  
  // Add to response headers for client-side tracking
  res.setHeader('X-Request-Id', requestId);
  
  next();
};

module.exports = requestIdMiddleware;
