const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const logger = require('../utils/logger');

class EnrollmentAttendanceService {
  /**
   * Get all enrollments for attendance marking
   */
  async getEnrollmentsForAttendance(academicYearId, classId, sectionId, schoolId) {
    try {
      // Build query object
      const query = {
        academicYearId,
        schoolId,
        status: 'enrolled'
      };
      
      // Add classId only if provided
      if (classId) {
        query.classId = classId;
      }
      
      // Add sectionId only if provided
      if (sectionId) {
        query.sectionId = sectionId;
      }
      
      const enrollments = await Enrollment.find(query)
        .populate('studentId', 'firstName lastName admissionNumber')
        .populate('classId', 'name')
        .populate('sectionId', 'name')
        .sort({ classId: 1, sectionId: 1, rollNumber: 1 });

      return {
        success: true,
        data: enrollments
      };
    } catch (error) {
      logger.error('Failed to get enrollments for attendance', {
        error: error.message,
        academicYearId,
        classId,
        sectionId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get enrollments for attendance',
        error: error.message
      };
    }
  }

  /**
   * Get all enrollments for an academic year (all classes)
   */
  async getAllEnrollmentsForAcademicYear(academicYearId, schoolId) {
    try {
      const enrollments = await Enrollment.find({
        academicYearId,
        schoolId,
        status: 'enrolled'
      })
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ classId: 1, sectionId: 1, rollNumber: 1 });

      // Group by class for better organization
      const groupedByClass = enrollments.reduce((acc, enrollment) => {
        const className = enrollment.classId?.name || 'Unknown Class';
        if (!acc[className]) {
          acc[className] = [];
        }
        acc[className].push(enrollment);
        return acc;
      }, {});

      return {
        success: true,
        data: {
          totalEnrollments: enrollments.length,
          enrollmentsByClass: groupedByClass,
          allEnrollments: enrollments
        }
      };
    } catch (error) {
      logger.error('Failed to get all enrollments for academic year', {
        error: error.message,
        academicYearId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get all enrollments for academic year',
        error: error.message
      };
    }
  }

  /**
   * Mark attendance for multiple students (enrollment-based)
   */
  async markAttendance(attendanceData, markedBy, schoolId) {
    const session = await mongoose.startSession();
    
    try {
      let transactionResult;
      
      await session.withTransaction(async () => {
        const { academicYearId, classId, sectionId, date, attendanceRecords } = attendanceData;
        
        // Validate date format
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0); // Set to start of day
        
        // Get existing attendance for this date/class/section
        const existingAttendance = await Attendance.find({
          academicYearId,
          classId,
          sectionId,
          date: attendanceDate,
          schoolId
        }).session(session);

        // Get enrollments to fetch studentId for each attendance record
        const enrollmentIds = attendanceRecords.map(record => record.enrollmentId);
        const enrollments = await Enrollment.find({
          _id: { $in: enrollmentIds },
          schoolId
        }).select('studentId').session(session);

        const enrollmentStudentMap = new Map();
        enrollments.forEach(enrollment => {
          enrollmentStudentMap.set(enrollment._id.toString(), enrollment.studentId);
        });

        const existingAttendanceMap = new Map();
        existingAttendance.forEach(record => {
          existingAttendanceMap.set(record.enrollmentId.toString(), record);
        });

        const attendanceOperations = [];
        const updatedRecords = [];

        for (const record of attendanceRecords) {
          const { enrollmentId, status } = record;
          // markedBy is already passed as parameter

          // Check if attendance already exists for this enrollment
          const existingRecord = existingAttendanceMap.get(enrollmentId.toString());

          if (existingRecord) {
            // Update existing attendance record
            attendanceOperations.push({
              updateOne: {
                filter: { _id: existingRecord._id },
                update: { 
                  status, 
                  markedBy,
                  updatedAt: new Date()
                }
              }
            });
            updatedRecords.push({
              ...existingRecord.toObject(),
              status,
              markedBy
            });
          } else {
            // Create new attendance record
            attendanceOperations.push({
              insertOne: {
                document: {
                  enrollmentId,
                  studentId: enrollmentStudentMap.get(enrollmentId.toString()), // Add studentId
                  academicYearId,
                  classId,
                  sectionId,
                  schoolId,
                  date: attendanceDate,
                  status,
                  markedBy,
                  attendanceType: 'daily'
                }
              }
            });
            updatedRecords.push({
              enrollmentId,
              studentId: enrollmentStudentMap.get(enrollmentId.toString()), // Add studentId
              academicYearId,
              classId,
              sectionId,
              schoolId,
              date: attendanceDate,
              status,
              markedBy,
              attendanceType: 'daily'
            });
          }
        }

        // Execute bulk operations
        if (attendanceOperations.length > 0) {
          await Attendance.bulkWrite(attendanceOperations, { session });
        }

        logger.info('Attendance marked successfully', {
          academicYearId,
          classId,
          sectionId,
          date: attendanceDate,
          totalRecords: attendanceOperations.length,
          markedBy,
          schoolId
        });

        // Store the result in the outer scope variable
        transactionResult = {
          success: true,
          message: 'Attendance marked successfully',
          data: updatedRecords,
          totalMarked: attendanceOperations.length
        };

        logger.info('About to return result from transaction:', { transactionResult });
      });

      logger.info('Transaction completed, returning result:', { transactionResult });
      return transactionResult;

    } catch (error) {
      logger.error('Failed to mark attendance', {
        error: error.message,
        attendanceData,
        markedBy,
        schoolId
      });
      
      // Only abort if session is active
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      
      return {
        success: false,
        message: 'Failed to mark attendance',
        error: error.message
      };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get attendance report by enrollment
   */
  async getAttendanceByEnrollment(enrollmentId, schoolId, startDate, endDate) {
    try {
      const query = {
        enrollmentId,
        schoolId
      };

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const attendance = await Attendance.find(query)
        .populate('markedBy', 'name')
        .sort({ date: 1 });

      // Calculate attendance statistics
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const absentDays = attendance.filter(a => a.status === 'Absent').length;
      const leaveDays = attendance.filter(a => a.status === 'Leave').length;
      const lateDays = attendance.filter(a => a.status === 'Late').length;

      const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

      return {
        success: true,
        data: {
          attendance,
          statistics: {
            totalDays,
            presentDays,
            absentDays,
            leaveDays,
            lateDays,
            attendancePercentage: parseFloat(attendancePercentage)
          }
        }
      };

    } catch (error) {
      logger.error('Failed to get attendance by enrollment', {
        error: error.message,
        enrollmentId,
        schoolId,
        startDate,
        endDate
      });
      
      return {
        success: false,
        message: 'Failed to get attendance',
        error: error.message
      };
    }
  }

  /**
   * Get class attendance summary
   */
  async getClassAttendanceSummary(academicYearId, classId, sectionId, schoolId, date) {
    try {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      const attendance = await Attendance.find({
        academicYearId,
        classId,
        sectionId,
        date: attendanceDate,
        schoolId
      })
      .populate({
        path: 'enrollmentId',
        populate: [
          { path: 'studentId', select: 'firstName lastName admissionNumber' }
        ]
      })
      .populate('markedBy', 'name')
      .sort({ 'enrollmentId.rollNumber': 1 });

      const summary = {
        totalStudents: attendance.length,
        present: attendance.filter(a => a.status === 'Present').length,
        absent: attendance.filter(a => a.status === 'Absent').length,
        leave: attendance.filter(a => a.status === 'Leave').length,
        late: attendance.filter(a => a.status === 'Late').length,
        attendanceDate: attendanceDate,
        attendance
      };

      return {
        success: true,
        data: summary
      };

    } catch (error) {
      logger.error('Failed to get class attendance summary', {
        error: error.message,
        academicYearId,
        classId,
        sectionId,
        schoolId,
        date
      });
      
      return {
        success: false,
        message: 'Failed to get class attendance summary',
        error: error.message
      };
    }
  }

  /**
   * Get attendance statistics for a class over a period
   */
  async getClassAttendanceStatistics(academicYearId, classId, sectionId, schoolId, startDate, endDate) {
    try {
      const matchStage = {
        academicYearId,
        classId,
        sectionId,
        schoolId,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      const statistics = await Attendance.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalDays: { $addToSet: '$date' },
            totalAttendanceRecords: { $sum: 1 },
            presentCount: {
              $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] }
            },
            absentCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
            },
            leaveCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] }
            },
            lateCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalWorkingDays: { $size: '$totalDays' },
            totalAttendanceRecords: 1,
            presentCount: 1,
            absentCount: 1,
            leaveCount: 1,
            lateCount: 1,
            attendancePercentage: {
              $multiply: [
                { $divide: ['$presentCount', '$totalAttendanceRecords'] },
                100
              ]
            }
          }
        }
      ]);

      return {
        success: true,
        data: statistics[0] || {
          totalWorkingDays: 0,
          totalAttendanceRecords: 0,
          presentCount: 0,
          absentCount: 0,
          leaveCount: 0,
          lateCount: 0,
          attendancePercentage: 0
        }
      };

    } catch (error) {
      logger.error('Failed to get class attendance statistics', {
        error: error.message,
        academicYearId,
        classId,
        sectionId,
        schoolId,
        startDate,
        endDate
      });
      
      return {
        success: false,
        message: 'Failed to get class attendance statistics',
        error: error.message
      };
    }
  }
}

module.exports = new EnrollmentAttendanceService();
