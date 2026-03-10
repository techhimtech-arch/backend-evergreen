console.log("⚡ app.js starting...");

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

console.log("⚡ basic modules loaded");

try {
  const config = require('./config/env');
  const logger = require('./config/logger');

  console.log("⚡ config loaded");

  // Create Express app
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // Basic routes
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });

  // Favicon route to prevent 404 errors
  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

  console.log("🔄 Loading API routes...");
  // API routes
  app.use('/api/auth', require('./modules/auth/auth.routes'));
  app.use('/api/users', require('./modules/users/users.routes'));
  app.use('/api/roles', require('./modules/roles/roles.routes'));
  console.log("✅ API routes loaded");

  // Swagger documentation
  const { swaggerUi, swaggerSpec } = require('../swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("✅ Swagger docs available at /api-docs");

  // Error handling middleware
  const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
  app.use(notFoundHandler);
  app.use(errorHandler);

  module.exports = app;
} catch (error) {
  console.error("❌ Error in app.js:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
}