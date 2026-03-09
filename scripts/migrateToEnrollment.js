const mongoose = require('mongoose');
const Student = require('../src/models/Student');
const Enrollment = require('../src/models/Enrollment');
const AcademicYear = require('../src/models/AcademicYear');
const Attendance = require('../src/models/Attendance');
const Result = require('../src/models/Result');
const StudentFee = require('../src/models/StudentFee');
require('dotenv').config();

class MigrationService {
  async migrateToEnrollment() {
    try {
      console.log('🚀 Starting migration to Enrollment-based system...');
      
      // Connect to database
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to database');

      // Step 1: Create current academic year if not exists
      const currentYear = await this.ensureCurrentAcademicYear();
      console.log('✅ Current academic year ready');

      // Step 2: Create enrollments for existing students
      await this.createEnrollmentsForExistingStudents(currentYear);
      console.log('✅ Enrollments created for existing students');

      // Step 3: Update existing records with enrollment references
      await this.updateExistingRecords();
      console.log('✅ Existing records updated with enrollment references');

      // Step 4: Update academic year references
      await this.updateAcademicYearReferences();
      console.log('✅ Academic year references updated');

      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  async ensureCurrentAcademicYear() {
    const schools = await mongoose.connection.db.collection('schools').distinct('_id');
    
    for (const schoolId of schools) {
      let currentYear = await AcademicYear.getCurrentYear(schoolId);
      
      if (!currentYear) {
        // Create current academic year
        const currentYearName = new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);
        currentYear = await AcademicYear.create({
          name: currentYearName,
          schoolId,
          startDate: new Date(new Date().getFullYear(), 3, 1), // April 1
          endDate: new Date(new Date().getFullYear() + 1, 2, 31), // March 31
          isCurrent: true,
          isActive: true,
        });
      }
    }
    
    return AcademicYear.findOne({ isCurrent: true });
  }

  async createEnrollmentsForExistingStudents(currentYear) {
    const students = await Student.find({ isActive: true });
    
    for (const student of students) {
      // Check if enrollment already exists
      const existingEnrollment = await Enrollment.findOne({
        studentId: student._id,
        academicYearId: currentYear._id,
      });

      if (!existingEnrollment && student.classId && student.sectionId) {
        await Enrollment.create({
          studentId: student._id,
          academicYearId: currentYear._id,
          classId: student.classId,
          sectionId: student.sectionId,
          rollNumber: student.rollNumber,
          schoolId: student.schoolId,
          status: 'enrolled',
          createdBy: student.createdBy,
        });
      }
    }
  }

  async updateExistingRecords() {
    // Update Attendance records
    const attendances = await Attendance.find({ enrollmentId: { $exists: false } });
    
    for (const attendance of attendances) {
      const enrollment = await Enrollment.findOne({
        studentId: attendance.studentId,
        academicYearId: attendance.academicYearId || await this.getCurrentYearId(attendance.schoolId),
      });

      if (enrollment) {
        await Attendance.updateOne(
          { _id: attendance._id },
          { 
            enrollmentId: enrollment._id,
            academicYearId: enrollment.academicYearId,
          }
        );
      }
    }

    // Update Result records
    const results = await Result.find({ enrollmentId: { $exists: false } });
    
    for (const result of results) {
      const enrollment = await Enrollment.findOne({
        studentId: result.studentId,
      });

      if (enrollment) {
        await Result.updateOne(
          { _id: result._id },
          { 
            enrollmentId: enrollment._id,
            academicYearId: enrollment.academicYearId,
          }
        );
      }
    }

    // Update StudentFee records
    const studentFees = await StudentFee.find({ enrollmentId: { $exists: false } });
    
    for (const fee of studentFees) {
      const enrollment = await Enrollment.findOne({
        studentId: fee.studentId,
      });

      if (enrollment) {
        await StudentFee.updateOne(
          { _id: fee._id },
          { 
            enrollmentId: enrollment._id,
            academicYearId: enrollment.academicYearId,
          }
        );
      }
    }
  }

  async updateAcademicYearReferences() {
    // Update Exam model to use ObjectId reference
    const exams = await mongoose.connection.db.collection('exams').find({}).toArray();
    
    for (const exam of exams) {
      if (typeof exam.academicYear === 'string') {
        const academicYear = await AcademicYear.findOne({ name: exam.academicYear });
        if (academicYear) {
          await mongoose.connection.db.collection('exams').updateOne(
            { _id: exam._id },
            { 
              $set: { academicYearId: academicYear._id },
              $unset: { academicYear: "" }
            }
          );
        }
      }
    }

    // Update FeeStructure model
    const feeStructures = await mongoose.connection.db.collection('feestructures').find({}).toArray();
    
    for (const feeStructure of feeStructures) {
      if (typeof feeStructure.academicYear === 'string') {
        const academicYear = await AcademicYear.findOne({ name: feeStructure.academicYear });
        if (academicYear) {
          await mongoose.connection.db.collection('feestructures').updateOne(
            { _id: feeStructure._id },
            { 
              $set: { academicYearId: academicYear._id },
              $unset: { academicYear: "" }
            }
          );
        }
      }
    }
  }

  async getCurrentYearId(schoolId) {
    const currentYear = await AcademicYear.getCurrentYear(schoolId);
    return currentYear?._id;
  }
}

// Run migration
if (require.main === module) {
  const migration = new MigrationService();
  migration.migrateToEnrollment();
}

module.exports = MigrationService;
