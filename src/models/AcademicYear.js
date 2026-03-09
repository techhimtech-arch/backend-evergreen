const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      // e.g., "2025-2026"
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Terms/Semesters within the academic year
    terms: [
      {
        name: {
          type: String,
          required: true,
          // e.g., "Term 1", "First Semester"
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    // Holidays and breaks
    holidays: [
      {
        name: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        description: {
          type: String,
        },
      },
    ],
    // Settings
    settings: {
      workingDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      gradingSystem: {
        type: String,
        enum: ['percentage', 'gpa', 'letter_grade', 'cgpa'],
        default: 'percentage',
      },
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for school and current year
academicYearSchema.index({ schoolId: 1, isCurrent: 1 });
academicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });

// Pre-save hook to ensure only one current academic year per school
academicYearSchema.pre('save', async function (next) {
  if (this.isCurrent && this.isModified('isCurrent')) {
    // Unset current flag for other academic years in the same school
    await this.constructor.updateMany(
      { schoolId: this.schoolId, _id: { $ne: this._id } },
      { isCurrent: false }
    );
  }
  next();
});

// Validate that endDate is after startDate
academicYearSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Static method to get current academic year for a school
academicYearSchema.statics.getCurrentYear = async function (schoolId) {
  return this.findOne({ schoolId, isCurrent: true, isActive: true });
};

// Static method to set current academic year
academicYearSchema.statics.setCurrentYear = async function (yearId, schoolId) {
  // First, unset all current flags for this school
  await this.updateMany({ schoolId }, { isCurrent: false });
  
  // Then set the specified year as current
  return this.findByIdAndUpdate(
    yearId,
    { isCurrent: true },
    { new: true }
  );
};

// Instance method to check if a date falls within this academic year
academicYearSchema.methods.containsDate = function (date) {
  const checkDate = new Date(date);
  return checkDate >= this.startDate && checkDate <= this.endDate;
};

// Instance method to check if a date is a working day
academicYearSchema.methods.isWorkingDay = function (date) {
  const checkDate = new Date(date);
  const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Check if it's a configured working day
  if (!this.settings.workingDays.includes(dayName)) {
    return false;
  }
  
  // Check if it's a holiday
  for (const holiday of this.holidays) {
    if (checkDate >= holiday.startDate && checkDate <= holiday.endDate) {
      return false;
    }
  }
  
  return true;
};

// Instance method to get current term
academicYearSchema.methods.getCurrentTerm = function (date = new Date()) {
  const checkDate = new Date(date);
  return this.terms.find(
    (term) => checkDate >= term.startDate && checkDate <= term.endDate && term.isActive
  );
};

module.exports = mongoose.model('AcademicYear', academicYearSchema);
