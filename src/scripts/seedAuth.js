const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const Role = require('../models/Role');
const logger = require('../config/logger');

async function seedAuth() {
  try {
    // Connect to database
    await mongoose.connect(config.database.uri);
    console.log('✅ Connected to MongoDB');

    // Create default roles
    const defaultRoles = [
      {
        name: 'superadmin',
        description: 'System administrator with full access',
        permissions: [
          'users:create', 'users:read', 'users:update', 'users:delete',
          'roles:create', 'roles:read', 'roles:update', 'roles:delete',
          'system:admin', 'system:audit',
        ]
      },
      {
        name: 'school_admin',
        description: 'School administrator with limited access',
        permissions: [
          'users:read', 'users:update',
          'school:read', 'school:update',
        ]
      },
      {
        name: 'teacher',
        description: 'Teacher with classroom management access',
        permissions: [
          'users:read',
          'classes:read', 'classes:update',
          'students:read', 'students:update',
          'attendance:create', 'attendance:read',
        ]
      }
    ];

    console.log('🌱 Creating default roles...');
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role(roleData);
        await role.save();
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`ℹ️  Role already exists: ${roleData.name}`);
      }
    }

    // Create superadmin user
    const adminRole = await Role.findOne({ name: 'superadmin' });
    if (adminRole) {
      const existingAdmin = await User.findOne({ email: 'admin@evergreen.com' });
      if (!existingAdmin) {
        const admin = new User({
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@evergreen.com',
          passwordHash: 'Admin123!@#', // Will be hashed by pre-save middleware
          roleId: adminRole._id,
          isActive: true,
          emailVerified: true
        });
        
        await admin.save();
        console.log('✅ Created superadmin user: admin@evergreen.com');
        console.log('🔑 Default password: Admin123!@#');
      } else {
        console.log('ℹ️  Superadmin user already exists');
      }
    }

    console.log('🎉 Authentication seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding authentication data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seeding script
if (require.main === module) {
  seedAuth();
}

module.exports = seedAuth;
