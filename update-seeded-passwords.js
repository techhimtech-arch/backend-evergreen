const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./src/config/env');
require('./src/models/User');

async function updatePasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.database.uri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log('Connected successfully.');

    const User = mongoose.model('User');
    const usersToUpdate = [
      { email: 'admin@school.com', password: 'Admin123!@#' },
      { email: 'schooladmin@school.com', password: 'SchoolAdmin123!@#' },
      { email: 'teacher@school.com', password: 'Teacher123!@#' },
      { email: 'student@school.com', password: 'Student123!@#' }
    ];

    for (const item of usersToUpdate) {
      const user = await User.findOne({ email: item.email });
      if (user) {
        console.log(`Updating password for ${item.email}...`);
        // Hash it once
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(item.password, salt);
        
        // Directly update without triggering schema pre-save hook
        await User.updateOne({ _id: user._id }, { $set: { passwordHash: hash } });
        console.log(`Password for ${item.email} updated successfully.`);
      } else {
        console.log(`User ${item.email} not found.`);
      }
    }
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

updatePasswords();
