const Attendance = require('../models/Attendance');
const TeacherAssignment = require('../models/TeacherAssignment');
const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

// POST /api/attendance (Daily attendance - by class teacher)
exports.markAttendance = asyncHandler(async (req, res, next) => {
  const { studentId, date, status, classId, sectionId, subjectId, attendanceType = 'daily' } = req.body;
  const { role, id: userId, schoolId } = req.user;

  // Validate student belongs to the same school
  if (!schoolId) {
    return next(new ErrorResponse('Unauthorized access', 403));
  }

  // Role-based authorization
  if (role === 'superadmin' || role === 'school_admin') {
    // Allow - no assignment check needed
  } else if (role === 'teacher') {
    if (attendanceType === 'daily') {
      // For daily attendance - check if teacher is CLASS TEACHER of this section
      const classTeacherAssignment = await ClassTeacherAssignment.findOne({
        teacherId: userId,
        classId,
        sectionId,
        schoolId,
        isActive: true,
      });

      if (!classTeacherAssignment) {
        return next(new ErrorResponse('You are not the class teacher of this section. Only class teachers can mark daily attendance.', 403));
      }
    } else if (attendanceType === 'subject' && subjectId) {
      // For subject-wise attendance - check subject assignment
      const assignment = await TeacherAssignment.findOne({
        teacherId: userId,
        classId,
        sectionId,
        subjectId,
        schoolId,
        isActive: true,
      });

      if (!assignment) {
        return next(new ErrorResponse('You are not authorized to mark attendance for this subject.', 403));
      }
    }
  } else {
    return next(new ErrorResponse('You are not authorized.', 403));
  }

  // Check for duplicate attendance
  const duplicateQuery = {
    studentId,
    date,
    schoolId,
    attendanceType,
  };
  if (attendanceType === 'subject' && subjectId) {
    duplicateQuery.subjectId = subjectId;
  }

  const existingAttendance = await Attendance.findOne(duplicateQuery);

  if (existingAttendance) {
    return next(new ErrorResponse('Attendance already marked for this student on this date', 400));
  }

  const attendance = await Attendance.create({
    studentId,
    classId,
    sectionId,
    subjectId: attendanceType === 'subject' ? subjectId : null,
    attendanceType,
    schoolId,
    date,
    status,
    markedBy: userId,
  });

  res.status(201).json({ success: true, data: attendance });
});

// POST /api/attendance/bulk (Bulk daily attendance - by class teacher)
exports.bulkMarkAttendance = asyncHandler(async (req, res, next) => {
  const { date, records, classId, sectionId, subjectId, attendanceType = 'daily' } = req.body;
  const { role, id: userId, schoolId } = req.user;

  // Role-based authorization
  if (role === 'superadmin' || role === 'school_admin') {
    // Allow - no assignment check needed
  } else if (role === 'teacher') {
    if (attendanceType === 'daily') {
      // For daily attendance - check if teacher is CLASS TEACHER
      const classTeacherAssignment = await ClassTeacherAssignment.findOne({
        teacherId: userId,
        classId,
        sectionId,
        schoolId,
        isActive: true,
      });

      if (!classTeacherAssignment) {
        return next(new ErrorResponse('You are not the class teacher of this section.', 403));
      }
    } else if (attendanceType === 'subject' && subjectId) {
      // For subject-wise attendance
      const assignment = await TeacherAssignment.findOne({
        teacherId: userId,
        classId,
        sectionId,
        subjectId,
        schoolId,
        isActive: true,
      });

      if (!assignment) {
        return next(new ErrorResponse('You are not authorized to mark attendance for this subject.', 403));
      }
    }
  } else {
    return next(new ErrorResponse('You are not authorized.', 403));
  }

  const bulkRecords = records.map((record) => ({
    ...record,
    classId,
    sectionId,
    subjectId: attendanceType === 'subject' ? subjectId : null,
    attendanceType,
    schoolId,
    markedBy: userId,
    date,
  }));

  try {
    const attendance = await Attendance.insertMany(bulkRecords, { ordered: false });
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    return next(new ErrorResponse('Error marking bulk attendance', 500));
  }
});

// GET /api/attendance
exports.getAttendance = asyncHandler(async (req, res, next) => {
  const { date, classId, sectionId, studentId } = req.query;
  const { role, id: userId, schoolId } = req.user;

  const query = {
    schoolId,
    date,
  };

  // Parent data isolation - only see their own children's attendance
  if (role === 'parent') {
    // Get parent's children
    const Student = require('../models/Student');
    const children = await Student.find({
      parentUserId: userId,
      schoolId,
    }).select('_id');

    if (children.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const childIds = children.map((child) => child._id);
    query.studentId = { $in: childIds };
  } else {
    // For admin/teacher - allow filtering by classId, sectionId, studentId
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (studentId) query.studentId = studentId;
  }

  const attendance = await Attendance.find(query)
    .populate('studentId', 'firstName lastName admissionNumber')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name')
    .populate('markedBy', 'name');

  res.status(200).json({ success: true, data: attendance });
});

// DELETE /api/attendance/:id
exports.deleteAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return next(new ErrorResponse('Attendance not found', 404));
  }

  if (attendance.schoolId.toString() !== req.user.schoolId.toString()) {
    return next(new ErrorResponse('Unauthorized to delete this attendance', 403));
  }

  await attendance.remove();

  res.status(200).json({ success: true, data: {} });
});