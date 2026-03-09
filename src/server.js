require('dotenv').config();

// Validate environment variables FIRST (before loading app)
const validateEnv = require('./config/validateEnv');
validateEnv();

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start the server
const server = app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    apiDocs: `http://localhost:${PORT}/api-docs`,
    security: ['Helmet', 'Rate Limiting', 'CORS'],
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { message: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  process.exit(1);
});