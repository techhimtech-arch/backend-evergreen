const mongoose = require('mongoose');
const config = require('./src/config/env');
require('./src/models/User');

async function testDeptAdminPassword() {
  try {
    await mongoose.connect(config.database.uri);
    const User = mongoose.model('User');

    const user = await User.findByEmailWithRole('admin@dept.com');
    if (user) {
      console.log('Testing password for:', user.email);
      console.log('User type:', user.userType);

      const testPassword = 'Qwerty@123';
      const isValid = await user.comparePassword(testPassword);
      console.log(`Password 'Qwerty@123': ${isValid ? 'VALID' : 'INVALID'}`);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}
testDeptAdminPassword();