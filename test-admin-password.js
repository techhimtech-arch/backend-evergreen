const mongoose = require('mongoose');
const config = require('./src/config/env');
require('./src/models/User');

async function testAdminPassword() {
  try {
    await mongoose.connect(config.database.uri);
    const User = mongoose.model('User');

    const user = await User.findByEmailWithRole('admin@evergreen.com');
    if (user) {
      console.log('Testing password for:', user.email);

      const testPassword = 'Admin123!@#';
      const isValid = await user.comparePassword(testPassword);
      console.log(`Password '${testPassword}': ${isValid ? 'VALID' : 'INVALID'}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}
testAdminPassword();