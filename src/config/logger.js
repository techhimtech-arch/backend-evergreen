const winston = require('winston');
const path = require('path');
// const config = require('./env'); // Removed to avoid circular dependency

// Create logs directory if it doesn't exist
const fs = require('fs');
// Use default path since config might not be loaded yet
const logsDir = path.dirname('logs/app.log');
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (error) {
  // In production, file system might be read-only, use console only
  console.log('Cannot create logs directory, using console logging only');
}

// Custom format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    });
  })
);

// Create logger instance with console transport only to avoid file issues
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add file transport later if possible
try {
  const config = require('./env'); // Require after env is loaded
  logger.add(new winston.transports.File({
    filename: config.logging.file,
    format: logFormat
  }));
} catch (error) {
  // If config is not loaded or file transport fails, continue with console only
  console.log('File logging not available, using console only');
}

module.exports = logger;
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'backend-api' },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (config.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
      })
    )
  }));
}

// Handle uncaught exceptions and rejections
logger.exceptions.handle(
  new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
);

logger.rejections.handle(
  new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })
);

module.exports = logger;
