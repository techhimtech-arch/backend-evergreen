const mongoose = require('mongoose');
const config = require('./src/config/env');
require('./src/models/User');

async function checkPasswords() {
  try {
    await mongoose.connect(config.database.uri);
    const User = mongoose.model('User');
    const users = await User.find({}, 'email passwordHash').lean();
    console.log('Users with passwords:');
    users.forEach(user => {
      const hasPassword = user.passwordHash ? 'YES' : 'NO';
      console.log(`- ${user.email}: Password set - ${hasPassword}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}
checkPasswords();