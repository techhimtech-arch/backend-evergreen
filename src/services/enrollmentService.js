const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const AcademicYear = require('../models/AcademicYear');
const { apiResponse } = require('../utils/apiResponse');

class EnrollmentService {
  // Enroll student in academic year
  async enrollStudent(enrollmentData) {
    try {
      const { studentId, academicYearId, classId, sectionId, rollNumber, schoolId } = enrollmentData;

      // Check if student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return apiResponse.notFound('Student not found');
      }

      // Check if academic year exists
      const academicYear = await AcademicYear.findById(academicYearId);
      if (!academicYear) {
        return apiResponse.notFound('Academic year not found');
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        studentId,
        academicYearId,
        status: 'enrolled'
      });

      if (existingEnrollment) {
        return apiResponse.validationError('Student already enrolled for this academic year');
      }

      // Create enrollment
      const enrollment = await Enrollment.create({
        ...enrollmentData,
        enrollmentDate: new Date(),
      });

      // Update student's current class/section for backward compatibility
      student.classId = classId;
      student.sectionId = sectionId;
      await student.save();

      return apiResponse.created('Student enrolled successfully', enrollment);
    } catch (error) {
      return apiResponse.error('Enrollment failed', error.message);
    }
  }

  // Get current enrollment for student
  async getCurrentEnrollment(studentId, schoolId) {
    try {
      const enrollment = await Enrollment.getCurrentEnrollment(studentId, schoolId);
      if (!enrollment) {
        return apiResponse.notFound('No current enrollment found');
      }
      return apiResponse.success('Current enrollment retrieved', enrollment);
    } catch (error) {
      return apiResponse.error('Failed to get current enrollment', error.message);
    }
  }

  // Get student enrollment history
  async getStudentHistory(studentId, schoolId) {
    try {
      const history = await Enrollment.getStudentHistory(studentId, schoolId);
      return apiResponse.success('Enrollment history retrieved', history);
    } catch (error) {
      return apiResponse.error('Failed to get enrollment history', error.message);
    }
  }

  // Promote student to next class
  async promoteStudent(studentId, currentEnrollmentId, newClassId, newSectionId, newRollNumber) {
    try {
      const enrollment = await Enrollment.findById(currentEnrollmentId);
      if (!enrollment) {
        return apiResponse.notFound('Current enrollment not found');
      }

      // Get next academic year
      const AcademicYear = require('../models/AcademicYear');
      const nextYear = await AcademicYear.getCurrentYear(enrollment.schoolId);
      
      if (!nextYear) {
        return apiResponse.validationError('No current academic year found');
      }

      // Promote current enrollment
      const newEnrollment = await enrollment.promote(newClassId, newSectionId, newRollNumber);

      return apiResponse.success('Student promoted successfully', newEnrollment);
    } catch (error) {
      return apiResponse.error('Promotion failed', error.message);
    }
  }

  // Get enrollments by class and section
  async getClassEnrollments(classId, sectionId, academicYearId, schoolId) {
    try {
      const enrollments = await Enrollment.find({
        classId,
        sectionId,
        academicYearId,
        schoolId,
        status: 'enrolled'
      })
      .populate('studentId', 'firstName lastName admissionNumber')
      .sort({ rollNumber: 1 });

      return apiResponse.success('Class enrollments retrieved', enrollments);
    } catch (error) {
      return apiResponse.error('Failed to get class enrollments', error.message);
    }
  }

  // Bulk enroll students
  async bulkEnrollStudents(enrollments) {
    try {
      const results = await Enrollment.insertMany(enrollments);
      return apiResponse.created('Bulk enrollment completed', results);
    } catch (error) {
      return apiResponse.error('Bulk enrollment failed', error.message);
    }
  }
}

module.exports = new EnrollmentService();
