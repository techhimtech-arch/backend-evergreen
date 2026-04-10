const mongoose = require('mongoose');
const config = require('./src/config/env');
require('./src/models/User');
require('./src/models/Role');

async function updateUserRole() {
  try {
    await mongoose.connect(config.database.uri);
    const User = mongoose.model('User');
    const Role = mongoose.model('Role');

    // Find the SUPER_ADMIN role
    const superAdminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
    console.log('SUPER_ADMIN role ID:', superAdminRole?._id);

    if (superAdminRole) {
      // Update the user to use SUPER_ADMIN role
      const result = await User.updateOne(
        { email: 'admin@evergreen.com' },
        { $set: { roleId: superAdminRole._id } }
      );

      console.log('User update result:', result);

      // Verify the change
      const user = await User.findOne({ email: 'admin@evergreen.com' }).populate('roleId');
      console.log('Updated user role:', user?.roleId?.name);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}
updateUserRole();