const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Student = require('../models/Student');
const TeacherAssignment = require('../models/TeacherAssignment');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const { getCurrentAcademicYearOrThrow } = require('../utils/academicYearHelper');

// POST /api/exams
exports.createExam = asyncHandler(async (req, res, next) => {
  const { name, classId, academicYear, examDate } = req.body;
  const { schoolId } = req.user;

  // If academicYear not provided, default to current academic year name
  let yearValue = academicYear;
  if (!yearValue) {
    const currentYear = await getCurrentAcademicYearOrThrow(schoolId);
    yearValue = currentYear.name;
  }

  const exam = await Exam.create({
    name,
    classId,
    schoolId,
    academicYear: yearValue,
    examDate,
  });

  res.status(201).json({ success: true, data: exam });
});

// POST /api/subjects
exports.createSubject = asyncHandler(async (req, res, next) => {
  const { name, classId } = req.body;

  const subject = await Subject.create({
    name,
    classId,
    schoolId: req.user.schoolId,
  });

  res.status(201).json({ success: true, data: subject });
});

// POST /api/results
exports.addResult = asyncHandler(async (req, res, next) => {
  const { studentId, examId, subjectId, marksObtained, maxMarks, grade, remarks } = req.body;
  const { role, id: userId, schoolId } = req.user;

  // Role-based authorization
  if (role === 'superadmin' || role === 'school_admin') {
    // Allow - no assignment check needed
  } else if (role === 'teacher') {
    // Get student's classId and sectionId for assignment verification
    const student = await Student.findById(studentId).select('classId sectionId');
    if (!student) {
      return next(new ErrorResponse('Student not found', 404));
    }

    // Verify teacher assignment
    const assignment = await TeacherAssignment.findOne({
      teacherId: userId,
      classId: student.classId,
      sectionId: student.sectionId,
      subjectId,
      schoolId,
      isActive: true,
    });

    if (!assignment) {
      return next(new ErrorResponse('You are not authorized to add marks for this subject.', 403));
    }
  } else {
    return next(new ErrorResponse('You are not authorized.', 403));
  }

  // Check for duplicate result
  const existingResult = await Result.findOne({
    studentId,
    examId,
    subjectId,
    schoolId,
  });

  if (existingResult) {
    return next(new ErrorResponse('Result already exists for this student, exam, and subject', 400));
  }

  const result = await Result.create({
    studentId,
    examId,
    subjectId,
    schoolId,
    marksObtained,
    maxMarks,
    grade,
    remarks,
    enteredBy: userId,
  });

  res.status(201).json({ success: true, data: result });
});

// GET /api/results/student/:studentId
exports.getStudentResults = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { examId, academicYear } = req.query;
  const { role, id: userId, schoolId } = req.user;

  // Parent data isolation - verify studentId belongs to parent
  if (role === 'parent') {
    const student = await Student.findOne({
      _id: studentId,
      parentUserId: userId,
      schoolId,
    });

    if (!student) {
      return next(new ErrorResponse('You are not authorized to access this data.', 403));
    }
  }

  const query = {
    studentId,
    schoolId,
  };

  // If specific examId is provided, use it directly
  if (examId) {
    query.examId = examId;
  } else if (academicYear) {
    // Filter by academic year via Exam collection
    const exams = await Exam.find({ schoolId, academicYear }).select('_id');

    if (exams.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const examIds = exams.map((exam) => exam._id);
    query.examId = { $in: examIds };
  }

  const results = await Result.find(query)
    .populate('subjectId', 'name')
    .populate('examId', 'name');

  res.status(200).json({ success: true, data: results });
});