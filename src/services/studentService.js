const Student = require('../models/Student');
const Class = require('../models/Class');
const Section = require('../models/Section');
const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const emailService = require('./emailService');

class StudentService {
  /**
   * Create a new student
   */
  async createStudent(studentData, schoolId, userInfo = {}) {
    const { role, userId } = userInfo;

    // If teacher, verify they are class teacher of this section
    if (role === 'teacher') {
      const classTeacherAssignment = await ClassTeacherAssignment.findOne({
        teacherId: userId,
        classId: studentData.classId,
        sectionId: studentData.sectionId,
        schoolId,
        isActive: true
      });

      if (!classTeacherAssignment) {
        throw { 
          status: 403, 
          message: 'You can only add students to sections where you are the class teacher' 
        };
      }
    }

    // Verify class exists and belongs to school
    const classExists = await Class.findOne({ 
      _id: studentData.classId, 
      schoolId, 
      isActive: true 
    });
    if (!classExists) {
      throw { status: 404, message: 'Class not found' };
    }

    // Verify section exists and belongs to school
    const sectionExists = await Section.findOne({ 
      _id: studentData.sectionId, 
      schoolId, 
      isActive: true 
    });
    if (!sectionExists) {
      throw { status: 404, message: 'Section not found' };
    }

    // Check duplicate admission number
    const existingStudent = await Student.findOne({
      admissionNumber: studentData.admissionNumber,
      schoolId,
      isActive: true
    });
    if (existingStudent) {
      throw { status: 400, message: 'Admission number already exists' };
    }

    const student = await Student.create({
      ...studentData,
      schoolId,
      createdBy: userId,
    });

    // Send admission confirmation email (async - don't wait)
    if (studentData.parentEmail) {
      emailService.sendAdmissionConfirmation(student, studentData.parentEmail).catch(err => {
        logger.error('Failed to send admission email', { error: err.message });
      });
    }

    return student;
  }

  /**
   * Get all students with pagination and filters
   */
  async getStudents(schoolId, options = {}) {
    const { page = 1, limit = 10, role, userId, classId, sectionId, search } = options;

    const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));
    const limitNum = Math.min(100, Math.max(1, limit));

    // Build query
    let query = { 
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isActive: true 
    };

    // Parent data isolation - only see their own children
    if (role === 'parent') {
      query.parentUserId = new mongoose.Types.ObjectId(userId);
    }

    // Teacher data isolation - only see their class teacher assigned sections
    if (role === 'teacher') {
      const classTeacherAssignments = await ClassTeacherAssignment.find({
        teacherId: userId,
        schoolId,
        isActive: true
      });

      if (classTeacherAssignments.length > 0) {
        // Teacher can see students from sections where they are class teacher
        const sectionConditions = classTeacherAssignments.map(a => ({
          classId: a.classId,
          sectionId: a.sectionId
        }));
        query.$or = sectionConditions;
      } else {
        // Teacher is not class teacher of any section - show no students
        return {
          students: [],
          pagination: { total: 0, page: 1, totalPages: 0, limit: limitNum }
        };
      }
    }

    // Optional filters (for admin or further filtering)
    if (classId && role !== 'teacher') query.classId = new mongoose.Types.ObjectId(classId);
    if (sectionId && role !== 'teacher') query.sectionId = new mongoose.Types.ObjectId(sectionId);
    
    // Search by name or admission number
    if (search) {
      const searchCondition = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { admissionNumber: { $regex: search, $options: 'i' } }
        ]
      };
      // Combine with existing query
      if (query.$or) {
        query = { $and: [{ $or: query.$or }, searchCondition] };
        query.$and[0].schoolId = new mongoose.Types.ObjectId(schoolId);
        query.$and[0].isActive = true;
      } else {
        query.$or = searchCondition.$or;
      }
    }

    const [totalCount, students] = await Promise.all([
      Student.countDocuments(query),
      Student.find(query)
        .populate('classId', 'name')
        .populate('sectionId', 'name')
        .populate('parentUserId', 'name email')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
    ]);

    return {
      students,
      pagination: {
        total: totalCount,
        page: Math.max(1, page),
        totalPages: Math.ceil(totalCount / limitNum),
        limit: limitNum
      }
    };
  }

  /**
   * Get student by ID
   */
  async getStudentById(id, schoolId) {
    const student = await Student.findOne({ _id: id, schoolId, isActive: true })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('parentUserId', 'name email');

    if (!student) {
      throw { status: 404, message: 'Student not found' };
    }

    return student;
  }

  /**
   * Update student
   */
  async updateStudent(id, schoolId, updates) {
    const student = await Student.findOne({ _id: id, schoolId, isActive: true });
    if (!student) {
      throw { status: 404, message: 'Student not found' };
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'gender', 'dateOfBirth',
      'classId', 'sectionId', 'parentName', 'parentPhone',
      'address', 'rollNumber', 'parentEmail'
    ];

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        student[field] = updates[field];
      }
    });

    await student.save();
    return student;
  }

  /**
   * Soft delete student
   */
  async deleteStudent(id, schoolId) {
    const student = await Student.findOne({ _id: id, schoolId, isActive: true });
    if (!student) {
      throw { status: 404, message: 'Student not found' };
    }

    student.isActive = false;
    await student.save();
    
    return { message: 'Student deleted successfully' };
  }

  /**
   * Bulk import students from CSV data
   */
  async bulkImportStudents(studentsData, schoolId) {
    const results = {
      success: [],
      failed: []
    };

    for (const data of studentsData) {
      try {
        // Validate required fields
        if (!data.admissionNumber || !data.firstName || !data.classId || !data.sectionId) {
          throw new Error('Missing required fields: admissionNumber, firstName, classId, sectionId');
        }

        const student = await this.createStudent({
          admissionNumber: data.admissionNumber,
          firstName: data.firstName,
          lastName: data.lastName || '',
          gender: data.gender,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          classId: data.classId,
          sectionId: data.sectionId,
          parentName: data.parentName,
          parentPhone: data.parentPhone,
          parentEmail: data.parentEmail,
          address: data.address,
          rollNumber: data.rollNumber
        }, schoolId);

        results.success.push({
          admissionNumber: data.admissionNumber,
          studentId: student._id
        });
      } catch (error) {
        results.failed.push({
          admissionNumber: data.admissionNumber || 'Unknown',
          error: error.message || 'Unknown error'
        });
      }
    }

    return results;
  }
}

module.exports = new StudentService();
