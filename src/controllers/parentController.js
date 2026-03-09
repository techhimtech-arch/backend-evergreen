const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const StudentFee = require('../models/StudentFee');
const FeePayment = require('../models/FeePayment');
const Result = require('../models/Result');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

// POST /api/parents - Create a new parent (school_admin only)
exports.createParent = asyncHandler(async (req, res, next) => {
  const { name, email, password, studentId } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return next(new ErrorResponse('Name, email, and password are required', 400));
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('Email already in use', 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create parent user
  const parent = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'parent',
    schoolId: req.user.schoolId,
  });

  // If studentId provided, link parent to student
  if (studentId) {
    const student = await Student.findOne({
      _id: studentId,
      schoolId: req.user.schoolId,
    });

    if (!student) {
      return next(new ErrorResponse('Student not found or does not belong to this school', 404));
    }

    student.parentUserId = parent._id;
    await student.save();
  }

  res.status(201).json({
    success: true,
    message: 'Parent created successfully',
    data: {
      _id: parent._id,
      name: parent.name,
      email: parent.email,
      role: parent.role,
      schoolId: parent.schoolId,
    },
  });
});

// PUT /api/parents/link-student - Link parent to student (school_admin only)
exports.linkParentToStudent = asyncHandler(async (req, res, next) => {
  const { parentId, studentId } = req.body;

  if (!parentId || !studentId) {
    return next(new ErrorResponse('parentId and studentId are required', 400));
  }

  // Verify parent exists and belongs to school
  const parent = await User.findOne({
    _id: parentId,
    role: 'parent',
    schoolId: req.user.schoolId,
  });

  if (!parent) {
    return next(new ErrorResponse('Parent not found or does not belong to this school', 404));
  }

  // Verify student exists and belongs to school
  const student = await Student.findOne({
    _id: studentId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('Student not found or does not belong to this school', 404));
  }

  // Link parent to student
  student.parentUserId = parentId;
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Parent linked to student successfully',
    data: student,
  });
});

// GET /api/parents - Get all parents (school_admin only)
exports.getParents = asyncHandler(async (req, res, next) => {
  const parents = await User.find({
    role: 'parent',
    schoolId: req.user.schoolId,
  }).select('-password');

  res.status(200).json({
    success: true,
    data: parents,
  });
});

// === Parent Portal Routes (for logged-in parent) ===
// Security: No studentId from frontend - fetched internally using parentUserId

// GET /api/parent/profile - Get parent profile with linked student info
exports.getProfile = asyncHandler(async (req, res, next) => {
  // Get parent info (exclude password)
  const parent = await User.findOne({
    _id: req.user.userId,
    schoolId: req.user.schoolId,
  }).select('-password');

  if (!parent) {
    return next(new ErrorResponse('Parent not found', 404));
  }

  // Get linked student info
  const student = await Student.findOne({
    parentUserId: req.user.userId,
    schoolId: req.user.schoolId,
  })
    .select('admissionNumber firstName lastName gender dateOfBirth classId sectionId')
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  res.status(200).json({
    success: true,
    data: {
      parent: {
        _id: parent._id,
        name: parent.name,
        email: parent.email,
        role: parent.role,
      },
      student: student || null,
    },
  });
});

// GET /api/parent/attendance - Get linked student's attendance
exports.getAttendance = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Fetch student internally using parentUserId
  const student = await Student.findOne({
    parentUserId: req.user.userId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('No linked student found', 404));
  }

  const query = {
    studentId: student._id,
    schoolId: req.user.schoolId,
  };

  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const attendance = await Attendance.find(query).sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: {
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
      },
      attendance,
    },
  });
});

// GET /api/parent/fees - Get linked student's fee details
exports.getFees = asyncHandler(async (req, res, next) => {
  // Fetch student internally using parentUserId
  const student = await Student.findOne({
    parentUserId: req.user.userId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('No linked student found', 404));
  }

  const studentFee = await StudentFee.findOne({
    studentId: student._id,
    schoolId: req.user.schoolId,
  });

  const payments = await FeePayment.find({
    studentId: student._id,
    schoolId: req.user.schoolId,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
      },
      totalAmount: studentFee?.totalAmount || 0,
      paidAmount: studentFee?.paidAmount || 0,
      balanceAmount: studentFee?.balanceAmount || 0,
      paymentHistory: payments,
    },
  });
});

// GET /api/parent/results - Get linked student's exam results
exports.getResults = asyncHandler(async (req, res, next) => {
  const { examId } = req.query;

  // Fetch student internally using parentUserId
  const student = await Student.findOne({
    parentUserId: req.user.userId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('No linked student found', 404));
  }

  const query = {
    studentId: student._id,
    schoolId: req.user.schoolId,
  };

  if (examId) query.examId = examId;

  const results = await Result.find(query)
    .populate('subjectId', 'name')
    .populate('examId', 'name examDate');

  // Calculate totals
  let totalMarksObtained = 0;
  let totalMaxMarks = 0;

  const subjectWiseMarks = results.map((result) => {
    totalMarksObtained += result.marksObtained || 0;
    totalMaxMarks += result.maxMarks || 0;
    return {
      subject: result.subjectId?.name || 'Unknown',
      marksObtained: result.marksObtained,
      maxMarks: result.maxMarks,
      grade: result.grade,
      remarks: result.remarks,
    };
  });

  // Calculate overall grade
  const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
  let overallGrade = 'F';
  if (percentage >= 90) overallGrade = 'A+';
  else if (percentage >= 80) overallGrade = 'A';
  else if (percentage >= 70) overallGrade = 'B+';
  else if (percentage >= 60) overallGrade = 'B';
  else if (percentage >= 50) overallGrade = 'C';
  else if (percentage >= 40) overallGrade = 'D';

  res.status(200).json({
    success: true,
    data: {
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
      },
      subjectWiseMarks,
      total: {
        marksObtained: totalMarksObtained,
        maxMarks: totalMaxMarks,
        percentage: percentage.toFixed(2),
      },
      grade: overallGrade,
    },
  });
});