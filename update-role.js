const mongoose = require('mongoose');
const config = require('./src/config/env');
require('./src/models/Role');

async function updateRoleName() {
  try {
    await mongoose.connect(config.database.uri);
    const Role = mongoose.model('Role');

    const result = await Role.updateOne(
      { name: 'superadmin' },
      { $set: { name: 'SUPER_ADMIN' } }
    );

    console.log('Update result:', result);

    // Verify the change
    const role = await Role.findOne({ name: 'SUPER_ADMIN' });
    console.log('Updated role:', role?.name);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}
updateRoleName();