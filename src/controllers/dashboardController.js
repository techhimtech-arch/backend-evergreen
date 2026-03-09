const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Attendance = require('../models/Attendance');
const FeePayment = require('../models/FeePayment');
const StudentFee = require('../models/StudentFee');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const logger = require('../utils/logger');

/**
 * @desc    Get dashboard statistics for school admin
 * @route   GET /api/dashboard
 * @access  Private (school_admin)
 * 
 * RECOMMENDED INDEXES:
 * - Student: { schoolId: 1, isActive: 1 }
 * - User: { schoolId: 1, role: 1, isActive: 1 }
 * - Class: { schoolId: 1, isActive: 1 }
 * - Section: { schoolId: 1, isActive: 1 }
 * - Attendance: { schoolId: 1, date: 1, status: 1 }
 * - FeePayment: { schoolId: 1 }
 * - StudentFee: { schoolId: 1 }
 * - Exam: { schoolId: 1, isActive: 1 }
 * - Result: { schoolId: 1 }
 */
const getDashboardStats = async (req, res) => {
  try {
    const schoolId = new mongoose.Types.ObjectId(req.user.schoolId);

    // Get today's date range (start and end of day)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Run all queries in parallel for better performance
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSections,
      attendanceStats,
      feesCollected,
      pendingFees,
      totalExams,
      totalResultsEntered,
    ] = await Promise.all([
      // Basic Stats - using countDocuments for simple counts
      Student.countDocuments({ schoolId, isActive: true }),
      
      User.countDocuments({ schoolId, role: 'teacher', isActive: true }),
      
      Class.countDocuments({ schoolId, isActive: true }),
      
      Section.countDocuments({ schoolId, isActive: true }),

      // Attendance Stats - using aggregation pipeline
      Attendance.aggregate([
        {
          $match: {
            schoolId,
            date: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            totalMarked: { $sum: 1 },
            presentCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
            },
            absentCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] },
            },
          },
        },
      ]),

      // Fees Stats - total collected using aggregation
      FeePayment.aggregate([
        {
          $match: { schoolId },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
          },
        },
      ]),

      // Pending Fees - sum of balanceAmount from StudentFee
      StudentFee.aggregate([
        {
          $match: { schoolId },
        },
        {
          $group: {
            _id: null,
            totalPending: { $sum: '$balanceAmount' },
          },
        },
      ]),

      // Exam Stats
      Exam.countDocuments({ schoolId, isActive: true }),
      
      Result.countDocuments({ schoolId }),
    ]);

    // Process attendance stats
    const attendanceData = attendanceStats[0] || {
      totalMarked: 0,
      presentCount: 0,
      absentCount: 0,
    };

    // Calculate attendance percentage
    const attendancePercentage =
      attendanceData.totalMarked > 0
        ? parseFloat(((attendanceData.presentCount / attendanceData.totalMarked) * 100).toFixed(2))
        : 0;

    // Process fees stats
    const totalFeesCollected = feesCollected[0]?.totalAmount || 0;
    const totalPendingFees = pendingFees[0]?.totalPending || 0;

    // Build response
    const dashboardData = {
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSections,
      },
      attendance: {
        totalMarked: attendanceData.totalMarked,
        presentCount: attendanceData.presentCount,
        absentCount: attendanceData.absentCount,
        attendancePercentage,
      },
      fees: {
        totalFeesCollected,
        totalPendingFees,
      },
      exams: {
        totalExams,
        totalResultsEntered,
      },
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    logger.error('Dashboard Error', { requestId: req.requestId, error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
