const mongoose = require('mongoose');
const config = require('./src/config/env');
require('./src/models/User');
require('./src/models/Role');

async function checkUserRoleAgain() {
  try {
    await mongoose.connect(config.database.uri);
    const User = mongoose.model('User');
    const Role = mongoose.model('Role');

    const user = await User.findOne({ email: 'admin@evergreen.com' }).populate('roleId');
    if (user) {
      console.log('User:', user.email);
      console.log('Role ID:', user.roleId?._id);
      console.log('Role Name:', user.roleId?.name);
      console.log('User Type:', user.userType);
    }

    // Check all roles again
    const roles = await Role.find({}, 'name').lean();
    console.log('\nAll roles:');
    roles.forEach(role => {
      console.log(`- ${role.name}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}
checkUserRoleAgain();