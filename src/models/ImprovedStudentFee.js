const mongoose = require('mongoose');

const improvedStudentFeeSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    // Keep studentId for backward compatibility
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ImprovedFeeStructure',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    
    // Fee details
    feeType: {
      type: String,
      enum: ['tuition', 'transport', 'admission', 'exam', 'library', 'laboratory', 'sports', 'other'],
      required: true,
    },
    feeName: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Payment tracking
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    concessionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lateFeeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Status management
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue', 'refunded'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    
    // Payment details
    payments: [{
      paymentDate: {
        type: Date,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      paymentMethod: {
        type: String,
        enum: ['cash', 'cheque', 'bank_transfer', 'online', 'card', 'upi'],
        required: true,
      },
      transactionId: {
        type: String,
      },
      receiptNumber: {
        type: String,
        required: true,
      },
      collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      remarks: {
        type: String,
      }
    }],
    
    // Additional metadata
    lastPaymentDate: {
      type: Date,
    },
    nextDueDate: {
      type: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderDates: [{
      date: Date,
      method: String, // email, sms, phone
      status: String // sent, failed
    }],
    
    // Refund details
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundDate: {
      type: Date,
    },
    refundReason: {
      type: String,
    },
    refundApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);

// Optimized indexes for performance
improvedStudentFeeSchema.index({ 
  enrollmentId: 1, 
  feeStructureId: 1, 
  schoolId: 1 
}, { unique: true });

improvedStudentFeeSchema.index({ 
  studentId: 1, 
  academicYearId: 1, 
  feeType: 1, 
  schoolId: 1 
});

improvedStudentFeeSchema.index({ 
  status: 1, 
  dueDate: 1, 
  schoolId: 1 
});

improvedStudentFeeSchema.index({ 
  classId: 1, 
  status: 1, 
  academicYearId: 1, 
  schoolId: 1 
});

improvedStudentFeeSchema.index({ 
  'payments.paymentDate': 1, 
  schoolId: 1 
});

// Virtual for payment percentage
improvedStudentFeeSchema.virtual('paymentPercentage').get(function() {
  if (this.totalAmount === 0) return 0;
  return ((this.paidAmount / this.totalAmount) * 100).toFixed(2);
});

// Virtual for days overdue
improvedStudentFeeSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'paid') return 0;
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = Math.abs(today - dueDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update balance and status
improvedStudentFeeSchema.pre('save', function(next) {
  // Calculate balance
  this.balanceAmount = this.totalAmount - this.paidAmount - this.concessionAmount + this.lateFeeAmount;
  
  // Update status based on payment
  if (this.balanceAmount <= 0) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else if (new Date() > this.dueDate) {
    this.status = 'overdue';
  } else {
    this.status = 'pending';
  }
  
  // Update last payment date
  if (this.payments.length > 0) {
    const lastPayment = this.payments[this.payments.length - 1];
    this.lastPaymentDate = lastPayment.paymentDate;
  }
  
  next();
});

// Static method to create student fees from fee structure
improvedStudentFeeSchema.statics.createFromFeeStructure = async function(enrollmentId, feeStructureId, createdBy) {
  const FeeStructure = mongoose.model('ImprovedFeeStructure');
  const Enrollment = mongoose.model('Enrollment');
  
  const [feeStructure, enrollment] = await Promise.all([
    FeeStructure.findById(feeStructureId),
    Enrollment.findById(enrollmentId).populate('studentId')
  ]);
  
  if (!feeStructure || !enrollment) {
    throw new Error('Fee structure or enrollment not found');
  }
  
  // Check if fee already exists
  const existingFee = await this.findOne({
    enrollmentId,
    feeStructureId,
    schoolId: enrollment.schoolId
  });
  
  if (existingFee) {
    throw new Error('Fee already exists for this enrollment');
  }
  
  const studentFee = new this({
    enrollmentId,
    studentId: enrollment.studentId._id,
    feeStructureId,
    schoolId: enrollment.schoolId,
    academicYearId: enrollment.academicYearId,
    classId: enrollment.classId,
    feeType: feeStructure.feeType,
    feeName: feeStructure.feeName,
    totalAmount: feeStructure.amount,
    balanceAmount: feeStructure.amount,
    dueDate: feeStructure.dueDate,
    createdBy
  });
  
  return studentFee.save();
};

// Static method to get student fee summary
improvedStudentFeeSchema.statics.getStudentFeeSummary = async function(studentId, academicYearId, schoolId) {
  const fees = await this.find({
    studentId,
    academicYearId,
    schoolId
  })
  .populate('feeStructureId', 'feeName dueDate')
  .populate('payments.collectedBy', 'name')
  .sort({ dueDate: 1 });
  
  const totalAmount = fees.reduce((sum, fee) => sum + fee.totalAmount, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
  const totalBalance = fees.reduce((sum, fee) => sum + fee.balanceAmount, 0);
  
  const statusCounts = fees.reduce((counts, fee) => {
    counts[fee.status] = (counts[fee.status] || 0) + 1;
    return counts;
  }, {});
  
  return {
    summary: {
      totalFees: totalAmount,
      totalPaid,
      totalBalance,
      paymentPercentage: totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(2) : 0,
      totalFeesCount: fees.length,
      statusCounts
    },
    fees: fees.map(fee => ({
      _id: fee._id,
      feeName: fee.feeName,
      feeType: fee.feeType,
      totalAmount: fee.totalAmount,
      paidAmount: fee.paidAmount,
      balanceAmount: fee.balanceAmount,
      status: fee.status,
      dueDate: fee.dueDate,
      paymentPercentage: fee.paymentPercentage,
      daysOverdue: fee.daysOverdue,
      payments: fee.payments,
      lastPaymentDate: fee.lastPaymentDate
    }))
  };
};

// Static method to get class fee summary
improvedStudentFeeSchema.statics.getClassFeeSummary = async function(classId, academicYearId, schoolId) {
  const pipeline = [
    {
      $match: {
        classId,
        academicYearId,
        schoolId
      }
    },
    {
      $group: {
        _id: '$feeType',
        totalAmount: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$paidAmount' },
        totalBalance: { $sum: '$balanceAmount' },
        studentCount: { $addToSet: '$studentId' },
        statusBreakdown: {
          $push: '$status'
        }
      }
    },
    {
      $addFields: {
        studentCount: { $size: '$studentCount' },
        paymentPercentage: {
          $multiply: [
            { $divide: ['$totalPaid', '$totalAmount'] },
            100
          ]
        },
        statusCounts: {
          $reduce: {
            input: ['$statusBreakdown'],
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [{ k: ['$$this'], v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]
                  ]
                }
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        feeType: '$_id',
        totalAmount: 1,
        totalPaid: 1,
        totalBalance: 1,
        studentCount: 1,
        paymentPercentage: { $round: ['$paymentPercentage', 2] },
        statusCounts: 1
      }
    },
    { $sort: { feeType: 1 } }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to get overdue fees
improvedStudentFeeSchema.statics.getOverdueFees = async function(schoolId, currentDate = new Date()) {
  return this.find({
    schoolId,
    status: { $in: ['pending', 'partial'] },
    dueDate: { $lt: currentDate }
  })
  .populate('studentId', 'firstName lastName admissionNumber')
  .populate('classId', 'name')
  .populate('feeStructureId', 'feeName')
  .sort({ dueDate: 1 });
};

// Instance method to add payment
improvedStudentFeeSchema.methods.addPayment = function(paymentData, collectedBy) {
  const payment = {
    paymentDate: new Date(),
    amount: paymentData.amount,
    paymentMethod: paymentData.paymentMethod,
    transactionId: paymentData.transactionId,
    receiptNumber: paymentData.receiptNumber || this.generateReceiptNumber(),
    collectedBy,
    remarks: paymentData.remarks
  };
  
  // Validate payment amount
  if (payment.amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }
  
  if (payment.amount > this.balanceAmount) {
    throw new Error('Payment amount exceeds balance amount');
  }
  
  this.payments.push(payment);
  this.paidAmount += payment.amount;
  this.updatedBy = collectedBy;
  
  return this.save();
};

// Instance method to generate receipt number
improvedStudentFeeSchema.methods.generateReceiptNumber = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `RCPT-${year}${month}${day}-${random}`;
};

// Instance method to calculate late fee
improvedStudentFeeSchema.methods.calculateLateFee = function() {
  if (this.status === 'paid') return 0;
  
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  
  if (today <= dueDate) return 0;
  
  const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
  const dailyLateFee = this.totalAmount * 0.01; // 1% per day (configurable)
  
  return daysOverdue * dailyLateFee;
};

module.exports = mongoose.model('ImprovedStudentFee', improvedStudentFeeSchema);
