const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const feeService = require('../services/feeService');
const logger = require('../utils/logger');

// Validation middleware for fee structure creation
const validateFeeStructure = [
  body('academicYearId')
    .notEmpty()
    .withMessage('Academic year ID is required')
    .isMongoId()
    .withMessage('Invalid academic year ID'),
  
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Invalid class ID'),
  
  body('feeType')
    .isIn(['tuition', 'transport', 'admission', 'exam', 'library', 'laboratory', 'sports', 'other'])
    .withMessage('Invalid fee type'),
  
  body('feeName')
    .notEmpty()
    .withMessage('Fee name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Fee name must be between 2 and 100 characters'),
  
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount must be at least 0'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    })
];

// Validation middleware for payment processing
const validatePayment = [
  body('feeId')
    .notEmpty()
    .withMessage('Fee ID is required')
    .isMongoId()
    .withMessage('Invalid fee ID'),
  
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be at least 0.01'),
  
  body('paymentMethod')
    .isIn(['cash', 'cheque', 'bank_transfer', 'online', 'card', 'upi'])
    .withMessage('Invalid payment method'),
  
  body('transactionId')
    .optional()
    .isString()
    .withMessage('Transaction ID must be a string'),
  
  body('remarks')
    .optional()
    .isString()
    .withMessage('Remarks must be a string')
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters')
];

// Create fee structure
const createFeeStructure = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const feeData = {
    ...req.body,
    createdBy: req.user._id
  };

  const result = await feeService.createFeeStructure(
    feeData,
    req.user._id,
    req.user.schoolId
  );

  res.status(result.success ? 201 : 400).json(result);
});

// Get fee structures
const getFeeStructures = asyncHandler(async (req, res) => {
  const { academicYearId, classId } = req.query;
  const { schoolId } = req.user;

  if (!academicYearId || !classId) {
    return res.status(400).json({
      success: false,
      message: 'Academic year ID and Class ID are required'
    });
  }

  const result = await feeService.getFeeStructures(
    academicYearId,
    classId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get student fee summary
const getStudentFeeSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { academicYearId } = req.query;
  const { schoolId } = req.user;

  if (!academicYearId) {
    return res.status(400).json({
      success: false,
      message: 'Academic year ID is required'
    });
  }

  const result = await feeService.getStudentFeeSummary(
    studentId,
    academicYearId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get class fee summary
const getClassFeeSummary = asyncHandler(async (req, res) => {
  const { classId, academicYearId } = req.query;
  const { schoolId } = req.user;

  if (!classId || !academicYearId) {
    return res.status(400).json({
      success: false,
      message: 'Class ID and Academic year ID are required'
    });
  }

  const result = await feeService.getClassFeeSummary(
    classId,
    academicYearId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Process fee payment
const processPayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const paymentData = {
    ...req.body,
    collectedBy: req.user._id
  };

  const result = await feeService.processPayment(
    paymentData,
    req.user._id,
    req.user.schoolId
  );

  res.status(result.success ? 201 : 400).json(result);
});

// Get overdue fees
const getOverdueFees = asyncHandler(async (req, res) => {
  const { schoolId } = req.user;

  const result = await feeService.getOverdueFees(schoolId);

  res.status(result.success ? 200 : 400).json(result);
});

// Get payment history
const getPaymentHistory = asyncHandler(async (req, res) => {
  const { schoolId } = req.user;
  const filters = req.query;

  const result = await feeService.getPaymentHistory(filters, schoolId);

  res.status(result.success ? 200 : 400).json(result);
});

// Generate fee reports
const generateFeeReport = asyncHandler(async (req, res) => {
  const { reportType } = req.params;
  const { schoolId } = req.user;
  const filters = req.query;

  const result = await feeService.generateFeeReport(
    reportType,
    filters,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Send fee reminders
const sendFeeReminders = asyncHandler(async (req, res) => {
  const { reminderType = 'overdue' } = req.body;
  const { schoolId } = req.user;

  const result = await feeService.sendFeeReminders(schoolId, reminderType);

  res.status(result.success ? 200 : 400).json(result);
});

// Get fee dashboard
const getFeeDashboard = asyncHandler(async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { academicYearId, classId } = req.query;

    let dashboardData = {};
    
    if (academicYearId && classId) {
      // Get class-specific data
      const [classSummary, overdueFees] = await Promise.all([
        feeService.getClassFeeSummary(classId, academicYearId, schoolId),
        feeService.getOverdueFees(schoolId)
      ]);
      
      dashboardData = {
        classSummary: classSummary.data,
        totalOverdueFees: overdueFees.totalOverdue,
        totalOverdueAmount: overdueFees.totalOverdueAmount
      };
    } else {
      // Get school-wide data
      const [overdueFees, paymentHistory] = await Promise.all([
        feeService.getOverdueFees(schoolId),
        feeService.getPaymentHistory({ schoolId }, schoolId)
      ]);
      
      dashboardData = {
        totalOverdueFees: overdueFees.totalOverdue,
        totalOverdueAmount: overdueFees.totalOverdueAmount,
        recentPayments: paymentHistory.data.slice(0, 10),
        totalPayments: paymentHistory.totalPayments,
        totalCollection: paymentHistory.totalAmount
      };
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    logger.error('Failed to get fee dashboard', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get fee dashboard'
    });
  }
});

// Get student fee details for payment
const getStudentFeeDetails = asyncHandler(async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYearId } = req.query;
    const { schoolId } = req.user;

    if (!academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Academic year ID is required'
      });
    }

    const feeSummary = await feeService.getStudentFeeSummary(
      studentId,
      academicYearId,
      schoolId
    );

    if (!feeSummary.success) {
      return res.status(400).json(feeSummary);
    }

    // Filter only pending and partial fees for payment
    const payableFees = feeSummary.data.fees.filter(fee => 
      fee.status === 'pending' || fee.status === 'partial'
    );

    res.status(200).json({
      success: true,
      data: {
        studentSummary: feeSummary.data.summary,
        payableFees,
        totalPayable: payableFees.reduce((sum, fee) => sum + fee.balanceAmount, 0)
      }
    });

  } catch (error) {
    logger.error('Failed to get student fee details', {
      error: error.message,
      studentId: req.params.studentId,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get student fee details'
    });
  }
});

// Get fee receipt
const getFeeReceipt = asyncHandler(async (req, res) => {
  try {
    const { feeId, receiptNumber } = req.params;
    const { schoolId } = req.user;

    // Find fee with specific receipt
    const fee = await ImprovedStudentFee.findOne({
      _id: feeId,
      schoolId,
      'payments.receiptNumber': receiptNumber
    })
    .populate('studentId', 'firstName lastName admissionNumber')
    .populate('classId', 'name')
    .populate('payments.collectedBy', 'name');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee receipt not found'
      });
    }

    const payment = fee.payments.find(p => p.receiptNumber === receiptNumber);

    res.status(200).json({
      success: true,
      data: {
        receipt: {
          receiptNumber: payment.receiptNumber,
          paymentDate: payment.paymentDate,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          remarks: payment.remarks,
          collectedBy: payment.collectedBy,
          student: fee.studentId,
          class: fee.classId,
          feeName: fee.feeName,
          feeType: fee.feeType,
          totalAmount: fee.totalAmount,
          balanceAmount: fee.balanceAmount,
          status: fee.status
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get fee receipt', {
      error: error.message,
      feeId: req.params.feeId,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get fee receipt'
    });
  }
});

module.exports = {
  createFeeStructure,
  getFeeStructures,
  getStudentFeeSummary,
  getClassFeeSummary,
  processPayment,
  getOverdueFees,
  getPaymentHistory,
  generateFeeReport,
  sendFeeReminders,
  getFeeDashboard,
  getStudentFeeDetails,
  getFeeReceipt,
  validateFeeStructure,
  validatePayment
};
