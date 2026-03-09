const mongoose = require('mongoose');

const improvedResultSchema = new mongoose.Schema(
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
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
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
    // Array of subjects with marks
    subjects: [{
      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
      },
      marksObtained: {
        type: Number,
        required: true,
        min: 0
      },
      maxMarks: {
        type: Number,
        required: true,
        min: 1
      },
      grade: {
        type: String,
        required: true
      },
      remarks: {
        type: String
      }
    }],
    // Calculated fields
    totalMarks: {
      type: Number,
      required: true,
      min: 0
    },
    maxTotalMarks: {
      type: Number,
      required: true,
      min: 1
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    overallGrade: {
      type: String,
      required: true
    },
    // Class/Section info for easy querying
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true
    },
    // Additional metadata
    rank: {
      type: Number,
      default: null
    },
    classAverage: {
      type: Number,
      default: null
    },
    remarks: {
      type: String,
      default: ''
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'verified', 'published'],
      default: 'draft'
    }
  },
  {
    timestamps: true,
  }
);

// Optimized indexes for performance
improvedResultSchema.index({ enrollmentId: 1, examId: 1, schoolId: 1 }, { unique: true });
improvedResultSchema.index({ studentId: 1, examId: 1, schoolId: 1 }, { unique: true, sparse: true }); // Legacy support
improvedResultSchema.index({ academicYearId: 1, classId: 1, sectionId: 1, examId: 1 });
improvedResultSchema.index({ examId: 1, classId: 1, percentage: -1 }); // For ranking
improvedResultSchema.index({ enteredBy: 1, status: 1 }); // For teacher's pending work
improvedResultSchema.index({ status: 1, examId: 1 }); // For verification workflow

// Grade calculation methods
improvedResultSchema.statics.calculateGrade = function(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
};

improvedResultSchema.statics.calculateSubjectGrade = function(marksObtained, maxMarks) {
  const percentage = (marksObtained / maxMarks) * 100;
  return this.calculateGrade(percentage);
};

// Instance method to calculate total and percentage
improvedResultSchema.methods.calculateTotal = function() {
  let totalMarks = 0;
  let maxTotalMarks = 0;

  this.subjects.forEach(subject => {
    totalMarks += subject.marksObtained;
    maxTotalMarks += subject.maxMarks;
  });

  this.totalMarks = totalMarks;
  this.maxTotalMarks = maxTotalMarks;
  this.percentage = maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0;
  this.overallGrade = this.constructor.calculateGrade(this.percentage);

  return this;
};

// Instance method to update subject grades
improvedResultSchema.methods.updateSubjectGrades = function() {
  this.subjects.forEach(subject => {
    subject.grade = this.constructor.calculateSubjectGrade(subject.marksObtained, subject.maxMarks);
  });
  return this;
};

// Pre-save middleware to auto-calculate totals and grades
improvedResultSchema.pre('save', function(next) {
  if (this.isModified('subjects')) {
    this.updateSubjectGrades();
    this.calculateTotal();
  }
  next();
});

// Static method to get student results for an exam
improvedResultSchema.statics.getStudentExamResults = async function(enrollmentId, examId, schoolId) {
  return this.findOne({
    enrollmentId,
    examId,
    schoolId
  })
  .populate('enrollmentId', 'studentId classId sectionId')
  .populate('studentId', 'firstName lastName admissionNumber')
  .populate('examId', 'name examDate')
  .populate('subjects.subjectId', 'name code')
  .populate('enteredBy', 'name')
  .populate('verifiedBy', 'name');
};

// Static method to get class results for an exam
improvedResultSchema.statics.getClassExamResults = async function(classId, sectionId, examId, schoolId) {
  const results = await this.find({
    classId,
    sectionId,
    examId,
    schoolId,
    status: 'published'
  })
  .populate('studentId', 'firstName lastName admissionNumber')
  .populate('examId', 'name examDate')
  .populate('subjects.subjectId', 'name code')
  .sort({ percentage: -1 });

  // Calculate ranks
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results;
};

// Static method to get class statistics for an exam
improvedResultSchema.statics.getClassExamStatistics = async function(classId, sectionId, examId, schoolId) {
  const pipeline = [
    {
      $match: {
        classId,
        sectionId,
        examId,
        schoolId,
        status: 'published'
      }
    },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        averagePercentage: { $avg: '$percentage' },
        highestPercentage: { $max: '$percentage' },
        lowestPercentage: { $min: '$percentage' },
        gradeDistribution: {
          $push: '$overallGrade'
        }
      }
    },
    {
      $addFields: {
        gradeCounts: {
          $reduce: {
            input: ['$gradeDistribution'],
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
        totalStudents: 1,
        averagePercentage: { $round: ['$averagePercentage', 2] },
        highestPercentage: { $round: ['$highestPercentage', 2] },
        lowestPercentage: { $round: ['$lowestPercentage', 2] },
        gradeCounts: 1
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalStudents: 0,
    averagePercentage: 0,
    highestPercentage: 0,
    lowestPercentage: 0,
    gradeCounts: {}
  };
};

// Static method to get subject-wise performance
improvedResultSchema.statics.getSubjectPerformance = async function(classId, sectionId, examId, schoolId) {
  const pipeline = [
    {
      $match: {
        classId,
        sectionId,
        examId,
        schoolId,
        status: 'published'
      }
    },
    { $unwind: '$subjects' },
    {
      $group: {
        _id: '$subjects.subjectId',
        subjectName: { $first: '$subjects.subjectId' },
        averageMarks: { $avg: '$subjects.marksObtained' },
        maxMarks: { $first: '$subjects.maxMarks' },
        averagePercentage: {
          $avg: { $multiply: [{ $divide: ['$subjects.marksObtained', '$subjects.maxMarks'] }, 100] }
        },
        highestMarks: { $max: '$subjects.marksObtained' },
        lowestMarks: { $min: '$subjects.marksObtained' },
        totalStudents: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subjectInfo'
      }
    },
    { $unwind: '$subjectInfo' },
    {
      $project: {
        _id: 1,
        subjectName: '$subjectInfo.name',
        averageMarks: { $round: ['$averageMarks', 2] },
        maxMarks: 1,
        averagePercentage: { $round: ['$averagePercentage', 2] },
        highestMarks: 1,
        lowestMarks: 1,
        totalStudents: 1
      }
    },
    { $sort: { subjectName: 1 } }
  ];

  return this.aggregate(pipeline);
};

module.exports = mongoose.model('ImprovedResult', improvedResultSchema);
