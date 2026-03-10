const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const UserType = require('../models/UserType');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const UserRole = require('../models/UserRole');
const RolePermission = require('../models/RolePermission');
const logger = require('../config/logger');

async function seedRbac() {
  try {
    // Connect to database
    await mongoose.connect(config.database.uri);
    console.log('✅ Connected to MongoDB');

    // 1. Create User Types
    console.log('🌱 Creating user types...');
    const userTypes = [
      { name: 'ADMIN', description: 'System administrators with full access' },
      { name: 'STAFF', description: 'Staff members with limited administrative access' },
      { name: 'CUSTOMER', description: 'Customers with basic access' },
      { name: 'PARTNER', description: 'Partners with specialized access' }
    ];

    for (const userTypeData of userTypes) {
      const existingUserType = await UserType.findOne({ name: userTypeData.name });
      if (!existingUserType) {
        const userType = new UserType(userTypeData);
        await userType.save();
        console.log(`✅ Created user type: ${userTypeData.name}`);
      } else {
        console.log(`ℹ️  User type already exists: ${userTypeData.name}`);
      }
    }

    // 2. Create Permissions
    console.log('🌱 Creating permissions...');
    const permissions = [
      // User Management
      { name: 'CREATE_USER', description: 'Create new users', resource: 'USER', action: 'CREATE' },
      { name: 'VIEW_USERS', description: 'View user list', resource: 'USER', action: 'READ' },
      { name: 'UPDATE_USER', description: 'Update user information', resource: 'USER', action: 'UPDATE' },
      { name: 'DELETE_USER', description: 'Delete users', resource: 'USER', action: 'DELETE' },
      
      // Role Management
      { name: 'CREATE_ROLE', description: 'Create new roles', resource: 'ROLE', action: 'CREATE' },
      { name: 'VIEW_ROLES', description: 'View role list', resource: 'ROLE', action: 'READ' },
      { name: 'UPDATE_ROLE', description: 'Update role information', resource: 'ROLE', action: 'UPDATE' },
      { name: 'DELETE_ROLE', description: 'Delete roles', resource: 'ROLE', action: 'DELETE' },
      
      // Permission Management
      { name: 'CREATE_PERMISSION', description: 'Create new permissions', resource: 'PERMISSION', action: 'CREATE' },
      { name: 'VIEW_PERMISSIONS', description: 'View permission list', resource: 'PERMISSION', action: 'READ' },
      { name: 'UPDATE_PERMISSION', description: 'Update permission information', resource: 'PERMISSION', action: 'UPDATE' },
      { name: 'DELETE_PERMISSION', description: 'Delete permissions', resource: 'PERMISSION', action: 'DELETE' },
      
      // User Type Management
      { name: 'VIEW_USER_TYPES', description: 'View user type list', resource: 'USER_TYPE', action: 'READ' },
      
      // Reports
      { name: 'VIEW_REPORTS', description: 'View system reports', resource: 'REPORT', action: 'READ' },
      { name: 'GENERATE_REPORTS', description: 'Generate system reports', resource: 'REPORT', action: 'CREATE' },
      
      // System Management
      { name: 'SYSTEM_ADMIN', description: 'Full system administration', resource: 'SYSTEM', action: 'MANAGE' },
      { name: 'SYSTEM_AUDIT', description: 'View system audit logs', resource: 'SYSTEM', action: 'READ' },
      
      // School Management (if applicable)
      { name: 'MANAGE_SCHOOL', description: 'Manage school information', resource: 'SCHOOL', action: 'MANAGE' },
      
      // Class Management (if applicable)
      { name: 'MANAGE_CLASSES', description: 'Manage class information', resource: 'CLASS', action: 'MANAGE' },
      
      // Student Management (if applicable)
      { name: 'MANAGE_STUDENTS', description: 'Manage student information', resource: 'STUDENT', action: 'MANAGE' }
    ];

    for (const permissionData of permissions) {
      const existingPermission = await Permission.findOne({ name: permissionData.name });
      if (!existingPermission) {
        const permission = new Permission(permissionData);
        await permission.save();
        console.log(`✅ Created permission: ${permissionData.name}`);
      } else {
        console.log(`ℹ️  Permission already exists: ${permissionData.name}`);
      }
    }

    // 3. Create Roles
    console.log('🌱 Creating roles...');
    const roles = [
      { name: 'SUPER_ADMIN', description: 'Super administrator with full system access' },
      { name: 'ADMIN', description: 'Administrator with broad access' },
      { name: 'MANAGER', description: 'Manager with team management access' },
      { name: 'EDITOR', description: 'Editor with content management access' },
      { name: 'USER', description: 'Basic user with limited access' }
    ];

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role(roleData);
        await role.save();
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`ℹ️  Role already exists: ${roleData.name}`);
      }
    }

    // 4. Assign Permissions to Roles
    console.log('🌱 Assigning permissions to roles...');
    
    // Get all roles and permissions
    const superAdminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
    const adminRole = await Role.findOne({ name: 'ADMIN' });
    const managerRole = await Role.findOne({ name: 'MANAGER' });
    const editorRole = await Role.findOne({ name: 'EDITOR' });
    const userRole = await Role.findOne({ name: 'USER' });

    const allPermissions = await Permission.find({ isActive: true });

    // Super Admin gets all permissions
    if (superAdminRole) {
      for (const permission of allPermissions) {
        const existingAssignment = await RolePermission.findOne({
          roleId: superAdminRole._id,
          permissionId: permission._id,
          isActive: true
        });

        if (!existingAssignment) {
          await RolePermission.create({
            roleId: superAdminRole._id,
            permissionId: permission._id,
            assignedBy: null // System assigned
          });
        }
      }
      console.log('✅ Assigned all permissions to SUPER_ADMIN');
    }

    // Admin gets most permissions except system admin
    if (adminRole) {
      const adminPermissions = allPermissions.filter(p => 
        !p.name.includes('SYSTEM_ADMIN') && !p.name.includes('DELETE_PERMISSION')
      );
      
      for (const permission of adminPermissions) {
        const existingAssignment = await RolePermission.findOne({
          roleId: adminRole._id,
          permissionId: permission._id,
          isActive: true
        });

        if (!existingAssignment) {
          await RolePermission.create({
            roleId: adminRole._id,
            permissionId: permission._id,
            assignedBy: null // System assigned
          });
        }
      }
      console.log('✅ Assigned permissions to ADMIN');
    }

    // Manager gets user and report permissions
    if (managerRole) {
      const managerPermissions = allPermissions.filter(p => 
        p.name.includes('USER') || p.name.includes('REPORT') || p.name.includes('VIEW_ROLES')
      );
      
      for (const permission of managerPermissions) {
        const existingAssignment = await RolePermission.findOne({
          roleId: managerRole._id,
          permissionId: permission._id,
          isActive: true
        });

        if (!existingAssignment) {
          await RolePermission.create({
            roleId: managerRole._id,
            permissionId: permission._id,
            assignedBy: null // System assigned
          });
        }
      }
      console.log('✅ Assigned permissions to MANAGER');
    }

    // Editor gets content-related permissions
    if (editorRole) {
      const editorPermissions = allPermissions.filter(p => 
        p.name.includes('VIEW_USERS') || p.name.includes('UPDATE_USER') || 
        p.name.includes('VIEW_REPORTS') || p.name.includes('GENERATE_REPORTS')
      );
      
      for (const permission of editorPermissions) {
        const existingAssignment = await RolePermission.findOne({
          roleId: editorRole._id,
          permissionId: permission._id,
          isActive: true
        });

        if (!existingAssignment) {
          await RolePermission.create({
            roleId: editorRole._id,
            permissionId: permission._id,
            assignedBy: null // System assigned
          });
        }
      }
      console.log('✅ Assigned permissions to EDITOR');
    }

    // User gets basic permissions
    if (userRole) {
      const basicPermissions = allPermissions.filter(p => 
        p.name.includes('VIEW_REPORTS')
      );
      
      for (const permission of basicPermissions) {
        const existingAssignment = await RolePermission.findOne({
          roleId: userRole._id,
          permissionId: permission._id,
          isActive: true
        });

        if (!existingAssignment) {
          await RolePermission.create({
            roleId: userRole._id,
            permissionId: permission._id,
            assignedBy: null // System assigned
          });
        }
      }
      console.log('✅ Assigned basic permissions to USER');
    }

    // 5. Create Super Admin User
    console.log('🌱 Creating super admin user...');
    const adminUserType = await UserType.findOne({ name: 'ADMIN' });
    const superAdminRoleObj = await Role.findOne({ name: 'SUPER_ADMIN' });
    
    if (adminUserType && superAdminRoleObj) {
      const existingAdmin = await User.findOne({ email: 'admin@evergreen.com' });
      if (!existingAdmin) {
        const admin = new User({
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@evergreen.com',
          passwordHash: 'Admin123!@#', // Will be hashed by pre-save middleware
          userTypeId: adminUserType._id,
          status: 'ACTIVE',
          emailVerified: true
        });
        
        await admin.save();
        
        // Assign SUPER_ADMIN role to the user
        await UserRole.create({
          userId: admin._id,
          roleId: superAdminRoleObj._id,
          assignedBy: admin._id // Self-assigned for system setup
        });
        
        console.log('✅ Created super admin user: admin@evergreen.com');
        console.log('🔑 Default password: Admin123!@#');
      } else {
        console.log('ℹ️  Super admin user already exists');
      }
    }

    console.log('🎉 RBAC seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- User Types: ${userTypes.length}`);
    console.log(`- Permissions: ${permissions.length}`);
    console.log(`- Roles: ${roles.length}`);
    console.log('- Role-Permission assignments completed');
    console.log('- Super Admin user created');
    
  } catch (error) {
    console.error('❌ Error seeding RBAC data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seeding script
if (require.main === module) {
  seedRbac();
}

module.exports = seedRbac;
