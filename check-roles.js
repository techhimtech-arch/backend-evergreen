const mongoose = require('mongoose');
const config = require('./src/config/env');
require('./src/models/Role');

async function checkRole() {
  try {
    await mongoose.connect(config.database.uri);
    const Role = mongoose.model('Role');

    const roles = await Role.find({}, 'name').lean();
    console.log('Roles in database:');
    roles.forEach(role => {
      console.log(`- ${role.name}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}
checkRole();