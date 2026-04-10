const mongoose = require('mongoose');
const config = require('./src/config/env');
require('./src/models/User');

async function testPassword() {
  try {
    await mongoose.connect(config.database.uri);
    const User = mongoose.model('User');

    const user = await User.findByEmailWithRole('admin@evergreen.com');
    if (user) {
      console.log('Testing password for:', user.email);

      // Test with common passwords
      const testPasswords = ['admin123', 'password', 'admin', '123456', 'superadmin'];

      for (const pwd of testPasswords) {
        const isValid = await user.comparePassword(pwd);
        console.log(`Password '${pwd}': ${isValid ? 'VALID' : 'INVALID'}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}
testPassword();