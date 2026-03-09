const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    tuitionFee: {
      type: Number,
      required: true,
    },
    transportFee: {
      type: Number,
      default: 0,
    },
    examFee: {
      type: Number,
      default: 0,
    },
    otherCharges: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

feeStructureSchema.index({ classId: 1, academicYear: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);