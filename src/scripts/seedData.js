require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { hashPassword } = require('../utils/password');
const logger = require('../config/logger');

async function seedData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to database for seeding');

    // Create superadmin user if it doesn't exist
    const existingSuperAdmin = await User.findOne({ email: 'admin@school.com' });
    
    if (!existingSuperAdmin) {
      const hashedPassword = await hashPassword('Admin123!@#');
      
      const superAdmin = new User({
        name: 'Super Admin',
        email: 'admin@school.com',
        password: hashedPassword,
        role: 'superadmin',
        isActive: true,
      });

      await superAdmin.save();
      logger.info('Super admin user created successfully');
    } else {
      logger.info('Super admin user already exists');
    }

    // Create sample school admin user if it doesn't exist
    const existingSchoolAdmin = await User.findOne({ email: 'schooladmin@school.com' });
    
    if (!existingSchoolAdmin) {
      const hashedPassword = await hashPassword('SchoolAdmin123!@#');
      
      const schoolAdmin = new User({
        name: 'School Admin',
        email: 'schooladmin@school.com',
        password: hashedPassword,
        role: 'school_admin',
        isActive: true,
      });

      await schoolAdmin.save();
      logger.info('School admin user created successfully');
    } else {
      logger.info('School admin user already exists');
    }

    // Create sample teacher user if it doesn't exist
    const existingTeacher = await User.findOne({ email: 'teacher@school.com' });
    
    if (!existingTeacher) {
      const hashedPassword = await hashPassword('Teacher123!@#');
      
      const teacher = new User({
        name: 'John Teacher',
        email: 'teacher@school.com',
        password: hashedPassword,
        role: 'teacher',
        isActive: true,
      });

      await teacher.save();
      logger.info('Teacher user created successfully');
    } else {
      logger.info('Teacher user already exists');
    }

    // Create sample student user if it doesn't exist
    const existingStudent = await User.findOne({ email: 'student@school.com' });
    
    if (!existingStudent) {
      const hashedPassword = await hashPassword('Student123!@#');
      
      const student = new User({
        name: 'Jane Student',
        email: 'student@school.com',
        password: hashedPassword,
        role: 'student',
        isActive: true,
      });

      await student.save();
      logger.info('Student user created successfully');
    } else {
      logger.info('Student user already exists');
    }

    logger.info('Seed data completed successfully');
    
    console.log('\n=== Seed Users Created ===');
    console.log('Super Admin: admin@school.com / Admin123!@#');
    console.log('School Admin: schooladmin@school.com / SchoolAdmin123!@#');
    console.log('Teacher: teacher@school.com / Teacher123!@#');
    console.log('Student: student@school.com / Student123!@#');
    console.log('========================\n');
    
    process.exit(0);

  } catch (error) {
    logger.error('Seeding failed', { error: error.message });
    process.exit(1);
  }
}

// Run seeding
seedData();
