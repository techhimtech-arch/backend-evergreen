const path = require('path');
const dotenv = require('dotenv');
// const logger = require('./logger'); // Removed to avoid circular dependency

/**
 * Load environment variables
 */
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

console.log('Dotenv loaded, checking key vars:');
console.log('process.env.MONGO_URI:', process.env.MONGO_URI ? 'EXISTS' : 'MISSING');
console.log('process.env.JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');
console.log('process.env.JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'EXISTS' : 'MISSING');

/**
 * Validate and get configuration
 */
const { validateEnv } = require('./validateEnv');
const env = validateEnv();

// Use console.log instead of logger to avoid circular dependency
console.log('Configuration loaded successfully');

/**
 * Application Configuration
 */
const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  
  database: {
    uri: env.MONGO_URI,
    name: env.MONGO_DB_NAME
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessTokenExpiry: env.JWT_ACCESS_EXPIRY,
    refreshTokenExpiry: env.JWT_REFRESH_EXPIRY
  },
  
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: env.RATE_LIMIT_MAX,
    authRateLimitMax: env.AUTH_RATE_LIMIT_MAX
  },
  
  cors: {
    origins: env.FRONTEND_URL 
      ? [env.FRONTEND_URL, 'http://localhost:4200', 'http://localhost:5173', 'http://localhost:3000']
      : ['http://localhost:4200', 'http://localhost:5173', 'http://localhost:3000'] // Default local dev ports (Angular, Vite, React)
  },
  
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE
  },
  
  redis: {
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD
  },
  
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  },
  
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES
  },
  
  api: {
    version: env.API_VERSION,
    prefix: env.API_PREFIX
  },
  
  session: {
    secret: env.SESSION_SECRET
  },
  
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET
  }
};

module.exports = config;