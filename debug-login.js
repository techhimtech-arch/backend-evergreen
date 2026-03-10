const mongoose = require('mongoose');
const config = require('./src/config/env');

async function debugLogin() {
  try {
    console.log('🔍 Debugging login service...');
    
    // Connect to MongoDB first
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(config.database.uri);
    console.log('✅ MongoDB connected');
    
    const requestInfo = {
      ipAddress: '127.0.0.1',
      userAgent: 'Debug Script'
    };

    console.log('1. Attempting login...');
    const authService = require('./src/modules/auth/auth.service');
    const result = await authService.login('admin@evergreen.com', 'Admin123!@#', requestInfo);
    
    console.log('✅ Login successful!');
    console.log('User:', JSON.stringify(result.user, null, 2));
    console.log('Access Token Length:', result.accessToken.length);
    console.log('Refresh Token Length:', result.refreshToken.length);
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

debugLogin();
