const mongoose = require('mongoose');

const improvedFeeStructureSchema = new mongoose.Schema(
  {
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
    feeType: {
      type: String,
      enum: ['tuition', 'transport', 'admission', 'exam', 'library', 'laboratory', 'sports', 'other'],
      required: true,
    },
    feeName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    installmentOptions: [{
      installmentNumber: Number,
      amount: Number,
      dueDate: Date,
      lateFee: Number,
      description: String
    }],
    lateFee: {
      type: Number,
      default: 0,
    },
    concessionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isRefundable: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Compound indexes for unique constraints and performance
improvedFeeStructureSchema.index({ 
  schoolId: 1, 
  academicYearId: 1, 
  classId: 1, 
  feeType: 1 
}, { unique: true });

improvedFeeStructureSchema.index({ 
  schoolId: 1, 
  academicYearId: 1, 
  feeType: 1 
});

improvedFeeStructureSchema.index({ 
  dueDate: 1, 
  schoolId: 1 
});

// Static method to get total fees for a class
improvedFeeStructureSchema.statics.getClassTotalFees = async function(academicYearId, classId, schoolId) {
  const feeStructures = await this.find({
    academicYearId,
    classId,
    schoolId,
    isActive: true
  });

  return {
    totalAmount: feeStructures.reduce((sum, fee) => sum + fee.amount, 0),
    feeBreakdown: feeStructures.map(fee => ({
      feeType: fee.feeType,
      feeName: fee.feeName,
      amount: fee.amount,
      dueDate: fee.dueDate
    }))
  };
};

// Static method to get overdue fees
improvedFeeStructureSchema.statics.getOverdueFees = async function(schoolId, currentDate = new Date()) {
  return this.find({
    schoolId,
    dueDate: { $lt: currentDate },
    isActive: true
  })
  .populate('academicYearId', 'name')
  .populate('classId', 'name')
  .sort({ dueDate: 1 });
};

module.exports = mongoose.model('ImprovedFeeStructure', improvedFeeStructureSchema);
