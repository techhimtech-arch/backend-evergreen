const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');
const FeePayment = require('../models/FeePayment');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const { getCurrentAcademicYearOrThrow } = require('../utils/academicYearHelper');

// POST /api/fees/structure
exports.createFeeStructure = asyncHandler(async (req, res, next) => {
  const { classId, academicYear, tuitionFee, transportFee, examFee, otherCharges } = req.body;
  const { schoolId } = req.user;

  // Default to current academic year if not provided
  let yearValue = academicYear;
  if (!yearValue) {
    const currentYear = await getCurrentAcademicYearOrThrow(schoolId);
    yearValue = currentYear.name;
  }

  const existingStructure = await FeeStructure.findOne({
    classId,
    academicYear: yearValue,
    schoolId,
  });

  if (existingStructure) {
    return next(new ErrorResponse('Fee structure already exists for this class and academic year', 400));
  }

  const feeStructure = await FeeStructure.create({
    classId,
    schoolId,
    academicYear: yearValue,
    tuitionFee,
    transportFee,
    examFee,
    otherCharges,
  });

  res.status(201).json({ success: true, data: feeStructure });
});

// POST /api/fees/assign/:studentId
exports.assignFeeToStudent = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { academicYear } = req.body;
  const { schoolId } = req.user;

  // Default to current academic year if not provided
  let yearValue = academicYear;
  if (!yearValue) {
    const currentYear = await getCurrentAcademicYearOrThrow(schoolId);
    yearValue = currentYear.name;
  }

  const feeStructure = await FeeStructure.findOne({
    classId: req.body.classId,
    academicYear: yearValue,
    schoolId,
  });

  if (!feeStructure) {
    return next(new ErrorResponse('Fee structure not found for this class and academic year', 404));
  }

  const totalAmount =
    feeStructure.tuitionFee +
    feeStructure.transportFee +
    feeStructure.examFee +
    feeStructure.otherCharges;

  const studentFee = await StudentFee.create({
    studentId,
    schoolId,
    academicYear: yearValue,
    totalAmount,
    balanceAmount: totalAmount,
  });

  res.status(201).json({ success: true, data: studentFee });
});

// POST /api/fees/payment/:studentId
exports.recordFeePayment = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { amount, paymentMode, academicYear } = req.body;
  const { schoolId, userId } = req.user;

  // Determine academic year for this payment
  let yearValue = academicYear;
  if (!yearValue) {
    const currentYear = await getCurrentAcademicYearOrThrow(schoolId);
    yearValue = currentYear.name;
  }

  const studentFee = await StudentFee.findOne({
    studentId,
    schoolId,
    academicYear: yearValue,
  });

  if (!studentFee) {
    return next(new ErrorResponse('Student fee record not found for this academic year', 404));
  }

  const feePayment = await FeePayment.create({
    studentId,
    schoolId,
    academicYear: yearValue,
    amount,
    paymentMode,
    receivedBy: userId,
  });

  studentFee.paidAmount += amount;
  studentFee.balanceAmount = studentFee.totalAmount - studentFee.paidAmount;
  await studentFee.save();

  res.status(201).json({ success: true, data: feePayment });
});

// GET /api/fees/student/:studentId
exports.getStudentFeeDetails = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { academicYear } = req.query;
  const { schoolId } = req.user;

  const feeQuery = {
    studentId,
    schoolId,
  };

  if (academicYear) {
    feeQuery.academicYear = academicYear;
  }

  // If academicYear not provided, get most recent record
  const studentFee = await StudentFee.findOne(feeQuery).sort({ createdAt: -1 });

  if (!studentFee) {
    return next(new ErrorResponse('Student fee record not found', 404));
  }

  const paymentQuery = {
    studentId,
    schoolId,
  };

  if (academicYear) {
    paymentQuery.academicYear = academicYear;
  }

  const paymentHistory = await FeePayment.find(paymentQuery).sort({ paymentDate: 1 });

  res.status(200).json({
    success: true,
    data: {
      totalAmount: studentFee.totalAmount,
      paidAmount: studentFee.paidAmount,
      balanceAmount: studentFee.balanceAmount,
      paymentHistory,
    },
  });
});