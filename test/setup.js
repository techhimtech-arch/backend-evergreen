const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectRedis } = require('../src/config/redis');

let mongoServer;

// Test environment setup
beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to test database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Mock Redis for testing
  jest.mock('../src/config/redis', () => ({
    connectRedis: jest.fn().mockResolvedValue(null),
    getRedisClient: jest.fn().mockReturnValue(null),
    cacheMiddleware: jest.fn().mockImplementation((keyPrefix, ttl) => (req, res, next) => next()),
    invalidateCache: jest.fn().mockResolvedValue(),
    setCache: jest.fn().mockResolvedValue(),
    getCache: jest.fn().mockResolvedValue(null)
  }));
});

afterAll(async () => {
  // Clean up database connections
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Global test utilities
global.createTestUser = async (userData = {}) => {
  const User = require('../src/models/User');
  const Organization = require('../src/models/Organization');
  
  // Create test organization if not exists
  let org = await Organization.findOne({ name: 'Test Organization' });
  if (!org) {
    org = await Organization.create({
      name: 'Test Organization',
      description: 'Test organization for unit tests',
      isActive: true
    });
  }
  
  // Create test user
  const defaultUserData = {
    email: 'test@example.com',
    passwordHash: 'hashedpassword123',
    firstName: 'Test',
    lastName: 'User',
    organizationId: org._id,
    userType: 'CITIZEN',
    status: 'ACTIVE',
    emailVerified: true,
    ...userData
  };
  
  return await User.create(defaultUserData);
};

global.createTestRole = async (roleData = {}) => {
  const Role = require('../src/models/Role');
  const Organization = require('../src/models/Organization');
  
  // Create test organization if not exists
  let org = await Organization.findOne({ name: 'Test Organization' });
  if (!org) {
    org = await Organization.create({
      name: 'Test Organization',
      description: 'Test organization for unit tests',
      isActive: true
    });
  }
  
  const defaultRoleData = {
    name: 'TEST_ROLE',
    description: 'Test role for unit tests',
    organizationId: org._id,
    isActive: true,
    isSystem: false,
    ...roleData
  };
  
  return await Role.create(defaultRoleData);
};

global.generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  const config = require('../src/config/env');
  
  return jwt.sign(
    { 
      userId, 
      email: 'test@example.com',
      role: 'CITIZEN'
    },
    config.jwt.secret,
    { expiresIn: config.jwt.accessTokenExpiry }
  );
};

module.exports = {
  createTestUser: global.createTestUser,
  createTestRole: global.createTestRole,
  generateTestToken: global.generateTestToken
};
