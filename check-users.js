const mongoose = require('mongoose');
const config = require('./src/config/env');
require('./src/models/User');

async function checkUsers() {
  try {
    await mongoose.connect(config.database.uri);
    const User = mongoose.model('User');
    const users = await User.find({}, 'email firstName lastName userType status organizationId').lean();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.userType}) - Status: ${user.status} - Org: ${user.organizationId || 'None'}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}
checkUsers();