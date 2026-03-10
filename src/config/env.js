const path = require('path');
const dotenv = require('dotenv');

/**
 * Load environment variables
 */
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

console.log("========== ENV DEBUG ==========");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded" : "Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "Missing");
console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET ? "Loaded" : "Missing");
console.log("================================");

/**
 * Validate required ENV variables
 */
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing ENV Variables:", missingEnvVars);
  process.exit(1);
}

/**
 * Application Configuration
 */
const config = {
  env: process.env.NODE_ENV || 'development',

  port: parseInt(process.env.PORT, 10) || 5000,

  database: {
    uri: process.env.MONGO_URI
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    rateLimitWindowMs:
      parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10
  },

  cors: {
    origins: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
      : []
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  }
};

module.exports = config;