require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const logger = require('../config/logger');

async function initializeDatabase() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to database for initialization');

    // Initialize default roles
    const rolesService = require('../modules/roles/roles.service');
    await rolesService.initializeDefaultRoles();
    logger.info('Default roles initialized successfully');

    // Create indexes for better performance
    const User = require('../models/User');
    const RefreshToken = require('../models/RefreshToken');
    const LoginAudit = require('../models/LoginAudit');

    // User indexes
    await User.createIndexes();
    logger.info('User indexes created');

    // RefreshToken indexes (already defined in schema)
    await RefreshToken.createIndexes();
    logger.info('RefreshToken indexes created');

    // LoginAudit indexes (already defined in schema)
    await LoginAudit.createIndexes();
    logger.info('LoginAudit indexes created');

    logger.info('Database initialization completed successfully');
    process.exit(0);

  } catch (error) {
    logger.error('Database initialization failed', { error: error.message });
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
