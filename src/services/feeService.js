const mongoose = require('mongoose');
const ImprovedStudentFee = require('../models/ImprovedStudentFee');
const ImprovedFeeStructure = require('../models/ImprovedFeeStructure');
const Enrollment = require('../models/Enrollment');
const logger = require('../utils/logger');

class FeeService {
  /**
   * Create fee structure for a class
   */
  async createFeeStructure(feeData, createdBy, schoolId) {
    try {
      const feeStructure = new ImprovedFeeStructure({
        ...feeData,
        schoolId,
        createdBy
      });
      
      await feeStructure.save();
      
      // Auto-create fees for existing students in the class
      await this.createFeesForExistingStudents(feeStructure._id, schoolId);
      
      logger.info('Fee structure created successfully', {
        feeStructureId: feeStructure._id,
        classId: feeData.classId,
        academicYearId: feeData.academicYearId,
        feeType: feeData.feeType,
        createdBy
      });
      
      return {
        success: true,
        message: 'Fee structure created successfully',
        data: feeStructure
      };
      
    } catch (error) {
      logger.error('Failed to create fee structure', {
        error: error.message,
        feeData,
        createdBy,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to create fee structure',
        error: error.message
      };
    }
  }

  /**
   * Create fees for existing students when fee structure is created
   */
  async createFeesForExistingStudents(feeStructureId, schoolId) {
    try {
      const feeStructure = await ImprovedFeeStructure.findById(feeStructureId);
      if (!feeStructure) {
        throw new Error('Fee structure not found');
      }
      
      // Get all enrollments for this class and academic year
      const enrollments = await Enrollment.find({
        classId: feeStructure.classId,
        academicYearId: feeStructure.academicYearId,
        schoolId,
        status: 'enrolled'
      });
      
      const feeCreationPromises = enrollments.map(enrollment => {
        return ImprovedStudentFee.createFromFeeStructure(
          enrollment._id,
          feeStructureId,
          feeStructure.createdBy
        );
      });
      
      const results = await Promise.allSettled(feeCreationPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      logger.info('Fees created for existing students', {
        feeStructureId,
        totalEnrollments: enrollments.length,
        successful,
        failed
      });
      
      return { successful, failed };
      
    } catch (error) {
      logger.error('Failed to create fees for existing students', {
        error: error.message,
        feeStructureId,
        schoolId
      });
      
      throw error;
    }
  }

  /**
   * Get fee structures for a class
   */
  async getFeeStructures(academicYearId, classId, schoolId) {
    try {
      const feeStructures = await ImprovedFeeStructure.find({
        academicYearId,
        classId,
        schoolId,
        isActive: true
      })
      .populate('createdBy', 'name')
      .sort({ feeType: 1, dueDate: 1 });
      
      return {
        success: true,
        data: feeStructures
      };
      
    } catch (error) {
      logger.error('Failed to get fee structures', {
        error: error.message,
        academicYearId,
        classId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get fee structures',
        error: error.message
      };
    }
  }

  /**
   * Get student fee summary
   */
  async getStudentFeeSummary(studentId, academicYearId, schoolId) {
    try {
      const feeSummary = await ImprovedStudentFee.getStudentFeeSummary(
        studentId,
        academicYearId,
        schoolId
      );
      
      return {
        success: true,
        data: feeSummary
      };
      
    } catch (error) {
      logger.error('Failed to get student fee summary', {
        error: error.message,
        studentId,
        academicYearId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get student fee summary',
        error: error.message
      };
    }
  }

  /**
   * Get class fee summary
   */
  async getClassFeeSummary(classId, academicYearId, schoolId) {
    try {
      const classSummary = await ImprovedStudentFee.getClassFeeSummary(
        classId,
        academicYearId,
        schoolId
      );
      
      // Get total class summary
      const totalSummary = classSummary.reduce((acc, feeType) => {
        acc.totalAmount += feeType.totalAmount;
        acc.totalPaid += feeType.totalPaid;
        acc.totalBalance += feeType.totalBalance;
        acc.studentCount = Math.max(acc.studentCount, feeType.studentCount);
        return acc;
      }, {
        totalAmount: 0,
        totalPaid: 0,
        totalBalance: 0,
        studentCount: 0
      });
      
      totalSummary.paymentPercentage = totalSummary.totalAmount > 0 
        ? ((totalSummary.totalPaid / totalSummary.totalAmount) * 100).toFixed(2)
        : 0;
      
      return {
        success: true,
        data: {
          totalSummary,
          feeTypeBreakdown: classSummary
        }
      };
      
    } catch (error) {
      logger.error('Failed to get class fee summary', {
        error: error.message,
        classId,
        academicYearId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get class fee summary',
        error: error.message
      };
    }
  }

  /**
   * Process fee payment
   */
  async processPayment(paymentData, collectedBy, schoolId) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const { feeId, amount, paymentMethod, transactionId, remarks } = paymentData;
        
        // Find the fee record
        const fee = await ImprovedStudentFee.findById(feeId).session(session);
        if (!fee) {
          throw new Error('Fee record not found');
        }
        
        if (fee.schoolId.toString() !== schoolId.toString()) {
          throw new Error('Unauthorized access to fee record');
        }
        
        // Generate receipt number
        const receiptNumber = fee.generateReceiptNumber();
        
        // Add payment
        await fee.addPayment({
          amount,
          paymentMethod,
          transactionId,
          receiptNumber,
          remarks
        }, collectedBy);
        
        logger.info('Fee payment processed successfully', {
          feeId,
          amount,
          paymentMethod,
          receiptNumber,
          collectedBy,
          schoolId
        });
        
        return {
          success: true,
          message: 'Payment processed successfully',
          data: {
            feeId: fee._id,
            receiptNumber,
            amountPaid: amount,
            balanceAmount: fee.balanceAmount,
            status: fee.status,
            paymentPercentage: fee.paymentPercentage
          }
        };
      });
      
    } catch (error) {
      logger.error('Failed to process payment', {
        error: error.message,
        paymentData,
        collectedBy,
        schoolId
      });
      
      await session.abortTransaction();
      
      return {
        success: false,
        message: 'Failed to process payment',
        error: error.message
      };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get overdue fees
   */
  async getOverdueFees(schoolId, currentDate = new Date()) {
    try {
      const overdueFees = await ImprovedStudentFee.getOverdueFees(schoolId, currentDate);
      
      return {
        success: true,
        data: overdueFees,
        totalOverdue: overdueFees.length,
        totalOverdueAmount: overdueFees.reduce((sum, fee) => sum + fee.balanceAmount, 0)
      };
      
    } catch (error) {
      logger.error('Failed to get overdue fees', {
        error: error.message,
        schoolId,
        currentDate
      });
      
      return {
        success: false,
        message: 'Failed to get overdue fees',
        error: error.message
      };
    }
  }

  /**
   * Get fee payment history
   */
  async getPaymentHistory(filters, schoolId) {
    try {
      const { startDate, endDate, classId, feeType, paymentMethod } = filters;
      
      const matchStage = { schoolId };
      
      if (startDate || endDate) {
        matchStage['payments.paymentDate'] = {};
        if (startDate) matchStage['payments.paymentDate'].$gte = new Date(startDate);
        if (endDate) matchStage['payments.paymentDate'].$lte = new Date(endDate);
      }
      
      if (classId) matchStage.classId = classId;
      if (feeType) matchStage.feeType = feeType;
      
      const pipeline = [
        { $match: matchStage },
        { $unwind: '$payments' },
        ...(startDate || endDate ? [{ $match: matchStage }] : []),
        {
          $match: paymentMethod ? { 'payments.paymentMethod': paymentMethod } : {}
        },
        {
          $lookup: {
            from: 'users',
            localField: 'payments.collectedBy',
            foreignField: '_id',
            as: 'collectedByInfo'
          }
        },
        { $unwind: '$collectedByInfo' },
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'studentInfo'
          }
        },
        { $unwind: '$studentInfo' },
        {
          $project: {
            _id: 0,
            receiptNumber: '$payments.receiptNumber',
            paymentDate: '$payments.paymentDate',
            amount: '$payments.amount',
            paymentMethod: '$payments.paymentMethod',
            transactionId: '$payments.transactionId',
            remarks: '$payments.remarks',
            feeName: '$feeName',
            feeType: '$feeType',
            studentName: {
              $concat: ['$studentInfo.firstName', ' ', '$studentInfo.lastName']
            },
            admissionNumber: '$studentInfo.admissionNumber',
            collectedBy: '$collectedByInfo.name'
          }
        },
        { $sort: { paymentDate: -1 } }
      ];
      
      const payments = await ImprovedStudentFee.aggregate(pipeline);
      
      return {
        success: true,
        data: payments,
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0)
      };
      
    } catch (error) {
      logger.error('Failed to get payment history', {
        error: error.message,
        filters,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get payment history',
        error: error.message
      };
    }
  }

  /**
   * Generate fee reports
   */
  async generateFeeReport(reportType, filters, schoolId) {
    try {
      const { academicYearId, classId, startDate, endDate } = filters;
      
      switch (reportType) {
        case 'class-wise':
          return this.generateClassWiseReport(academicYearId, classId, schoolId);
          
        case 'payment-history':
          return this.getPaymentHistory(filters, schoolId);
          
        case 'overdue':
          return this.getOverdueFees(schoolId);
          
        case 'collection-summary':
          return this.generateCollectionSummary(academicYearId, startDate, endDate, schoolId);
          
        default:
          throw new Error('Invalid report type');
      }
      
    } catch (error) {
      logger.error('Failed to generate fee report', {
        error: error.message,
        reportType,
        filters,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to generate fee report',
        error: error.message
      };
    }
  }

  /**
   * Generate class-wise fee report
   */
  async generateClassWiseReport(academicYearId, classId, schoolId) {
    try {
      const [classSummary, studentFees] = await Promise.all([
        this.getClassFeeSummary(classId, academicYearId, schoolId),
        ImprovedStudentFee.find({
          classId,
          academicYearId,
          schoolId
        })
        .populate('studentId', 'firstName lastName admissionNumber')
        .populate('feeStructureId', 'feeName dueDate')
        .sort({ 'studentId.admissionNumber': 1, dueDate: 1 })
      ]);
      
      // Group by student
      const studentWiseFees = studentFees.reduce((acc, fee) => {
        const studentId = fee.studentId._id.toString();
        if (!acc[studentId]) {
          acc[studentId] = {
            student: fee.studentId,
            fees: [],
            totalAmount: 0,
            totalPaid: 0,
            totalBalance: 0
          };
        }
        
        acc[studentId].fees.push({
          feeName: fee.feeName,
          feeType: fee.feeType,
          totalAmount: fee.totalAmount,
          paidAmount: fee.paidAmount,
          balanceAmount: fee.balanceAmount,
          status: fee.status,
          dueDate: fee.dueDate,
          paymentPercentage: fee.paymentPercentage
        });
        
        acc[studentId].totalAmount += fee.totalAmount;
        acc[studentId].totalPaid += fee.paidAmount;
        acc[studentId].totalBalance += fee.balanceAmount;
        
        return acc;
      }, {});
      
      return {
        success: true,
        data: {
          classSummary: classSummary.data,
          studentWiseFees: Object.values(studentWiseFees)
        }
      };
      
    } catch (error) {
      logger.error('Failed to generate class-wise report', {
        error: error.message,
        academicYearId,
        classId,
        schoolId
      });
      
      throw error;
    }
  }

  /**
   * Generate collection summary
   */
  async generateCollectionSummary(academicYearId, startDate, endDate, schoolId) {
    try {
      const matchStage = { schoolId, academicYearId };
      
      if (startDate || endDate) {
        matchStage['payments.paymentDate'] = {};
        if (startDate) matchStage['payments.paymentDate'].$gte = new Date(startDate);
        if (endDate) matchStage['payments.paymentDate'].$lte = new Date(endDate);
      }
      
      const pipeline = [
        { $match: matchStage },
        { $unwind: '$payments' },
        ...(startDate || endDate ? [{ $match: matchStage }] : []),
        {
          $group: {
            _id: {
              paymentMethod: '$payments.paymentMethod',
              feeType: '$feeType'
            },
            totalAmount: { $sum: '$payments.amount' },
            transactionCount: { $sum: 1 },
            averageAmount: { $avg: '$payments.amount' }
          }
        },
        {
          $group: {
            _id: '$_id.paymentMethod',
            paymentMethods: {
              $push: {
                feeType: '$_id.feeType',
                totalAmount: '$totalAmount',
                transactionCount: '$transactionCount',
                averageAmount: '$averageAmount'
              }
            },
            totalAmount: { $sum: '$totalAmount' },
            totalTransactions: { $sum: '$transactionCount' }
          }
        },
        {
          $project: {
            _id: 0,
            paymentMethod: '$_id',
            paymentMethods: 1,
            totalAmount: 1,
            totalTransactions: 1
          }
        },
        { $sort: { paymentMethod: 1 } }
      ];
      
      const collectionSummary = await ImprovedStudentFee.aggregate(pipeline);
      
      return {
        success: true,
        data: collectionSummary
      };
      
    } catch (error) {
      logger.error('Failed to generate collection summary', {
        error: error.message,
        academicYearId,
        startDate,
        endDate,
        schoolId
      });
      
      throw error;
    }
  }

  /**
   * Send fee reminders
   */
  async sendFeeReminders(schoolId, reminderType = 'overdue') {
    try {
      const currentDate = new Date();
      let reminderDate = new Date(currentDate);
      
      if (reminderType === 'upcoming') {
        reminderDate.setDate(reminderDate.getDate() + 7); // 7 days before due
      }
      
      const fees = await ImprovedStudentFee.find({
        schoolId,
        status: { $in: ['pending', 'partial'] },
        reminderSent: false,
        dueDate: reminderType === 'overdue' 
          ? { $lt: currentDate }
          : { $gte: currentDate, $lte: reminderDate }
      })
      .populate('studentId', 'firstName lastName')
      .populate('classId', 'name');
      
      // Here you would integrate with email/SMS service
      const reminderPromises = fees.map(fee => {
        return this.sendIndividualReminder(fee, reminderType);
      });
      
      const results = await Promise.allSettled(reminderPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      logger.info('Fee reminders sent', {
        reminderType,
        totalFees: fees.length,
        successful,
        failed,
        schoolId
      });
      
      return {
        success: true,
        message: `${successful} reminders sent successfully`,
        data: {
          totalFees: fees.length,
          successful,
          failed
        }
      };
      
    } catch (error) {
      logger.error('Failed to send fee reminders', {
        error: error.message,
        reminderType,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to send fee reminders',
        error: error.message
      };
    }
  }

  /**
   * Send individual reminder (placeholder for email/SMS integration)
   */
  async sendIndividualReminder(fee, reminderType) {
    // This would integrate with your email/SMS service
    // For now, just mark as sent
    fee.reminderSent = true;
    fee.reminderDates.push({
      date: new Date(),
      method: 'email',
      status: 'sent'
    });
    
    await fee.save();
    
    return { success: true };
  }
}

module.exports = new FeeService();
