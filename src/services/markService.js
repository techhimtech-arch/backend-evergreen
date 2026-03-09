const mongoose = require('mongoose');
const ImprovedResult = require('../models/ImprovedResult');
const Enrollment = require('../models/Enrollment');
const Exam = require('../models/Exam');
const Subject = require('../models/Subject');
const logger = require('../utils/logger');

class MarkService {
  /**
   * Get students for mark entry
   */
  async getStudentsForMarkEntry(examId, classId, sectionId, schoolId) {
    try {
      // Get exam details
      const exam = await Exam.findOne({ _id: examId, schoolId });
      if (!exam) {
        return {
          success: false,
          message: 'Exam not found'
        };
      }

      // Get enrollments for this class/section
      const enrollments = await Enrollment.find({
        classId,
        sectionId,
        academicYearId: exam.academicYear,
        schoolId,
        status: 'enrolled'
      })
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ rollNumber: 1 });

      // Get subjects for this class
      const subjects = await Subject.find({
        classId,
        schoolId,
        isActive: true
      }).sort({ name: 1 });

      // Check if results already exist
      const existingResults = await ImprovedResult.find({
        examId,
        classId,
        sectionId,
        schoolId
      });

      const existingResultMap = new Map();
      existingResults.forEach(result => {
        existingResultMap.set(result.enrollmentId.toString(), result);
      });

      // Prepare student data with existing marks
      const studentsData = enrollments.map(enrollment => {
        const existingResult = existingResultMap.get(enrollment._id.toString());
        
        return {
          enrollmentId: enrollment._id,
          studentId: enrollment.studentId._id,
          studentName: `${enrollment.studentId.firstName} ${enrollment.studentId.lastName}`,
          admissionNumber: enrollment.studentId.admissionNumber,
          rollNumber: enrollment.rollNumber,
          existingResult: existingResult,
          subjects: subjects.map(subject => {
            const existingSubject = existingResult?.subjects.find(
              s => s.subjectId.toString() === subject._id.toString()
            );
            
            return {
              subjectId: subject._id,
              subjectName: subject.name,
              maxMarks: 100, // Default max marks - can be configured per subject
              marksObtained: existingSubject?.marksObtained || 0,
              grade: existingSubject?.grade || 'F',
              remarks: existingSubject?.remarks || ''
            };
          })
        };
      });

      return {
        success: true,
        data: {
          exam,
          subjects,
          students: studentsData,
          totalStudents: enrollments.length,
          existingResultsCount: existingResults.length
        }
      };

    } catch (error) {
      logger.error('Failed to get students for mark entry', {
        error: error.message,
        examId,
        classId,
        sectionId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get students for mark entry',
        error: error.message
      };
    }
  }

  /**
   * Save marks for multiple students
   */
  async saveMarks(marksData, enteredBy, schoolId) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const { examId, classId, sectionId, students } = marksData;
        
        const results = [];
        
        for (const studentData of students) {
          const { enrollmentId, subjects, status = 'draft' } = studentData;
          
          // Validate subjects data
          if (!subjects || subjects.length === 0) {
            throw new Error(`No subjects provided for student ${enrollmentId}`);
          }

          // Prepare subjects array with calculated grades
          const processedSubjects = subjects.map(subject => {
            const { subjectId, marksObtained, maxMarks = 100, remarks } = subject;
            
            // Validate marks
            if (marksObtained < 0 || marksObtained > maxMarks) {
              throw new Error(`Invalid marks for subject ${subjectId}: ${marksObtained}/${maxMarks}`);
            }

            const grade = ImprovedResult.calculateSubjectGrade(marksObtained, maxMarks);

            return {
              subjectId,
              marksObtained,
              maxMarks,
              grade,
              remarks: remarks || ''
            };
          });

          // Get enrollment details
          const enrollment = await Enrollment.findById(enrollmentId).session(session);
          if (!enrollment) {
            throw new Error(`Enrollment not found: ${enrollmentId}`);
          }

          // Check if result already exists
          const existingResult = await ImprovedResult.findOne({
            enrollmentId,
            examId,
            schoolId
          }).session(session);

          if (existingResult) {
            // Update existing result
            existingResult.subjects = processedSubjects;
            existingResult.enteredBy = enteredBy;
            existingResult.status = status;
            existingResult.updatedAt = new Date();
            
            // Auto-calculate totals and grades
            existingResult.calculateTotal();
            
            await existingResult.save({ session });
            results.push(existingResult);
            
          } else {
            // Create new result
            const result = new ImprovedResult({
              enrollmentId,
              studentId: enrollment.studentId,
              examId,
              schoolId,
              academicYearId: enrollment.academicYearId,
              classId,
              sectionId,
              subjects: processedSubjects,
              enteredBy,
              status
            });
            
            // Auto-calculate totals and grades
            result.calculateTotal();
            
            await result.save({ session });
            results.push(result);
          }
        }

        logger.info('Marks saved successfully', {
          examId,
          classId,
          sectionId,
          totalStudents: students.length,
          enteredBy,
          schoolId
        });

        return {
          success: true,
          message: 'Marks saved successfully',
          data: results,
          totalSaved: results.length
        };
      });

    } catch (error) {
      logger.error('Failed to save marks', {
        error: error.message,
        marksData,
        enteredBy,
        schoolId
      });
      
      await session.abortTransaction();
      
      return {
        success: false,
        message: 'Failed to save marks',
        error: error.message
      };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get student results for an exam
   */
  async getStudentExamResults(enrollmentId, examId, schoolId) {
    try {
      const result = await ImprovedResult.getStudentExamResults(enrollmentId, examId, schoolId);
      
      if (!result) {
        return {
          success: false,
          message: 'Results not found for this student and exam'
        };
      }

      return {
        success: true,
        data: result
      };

    } catch (error) {
      logger.error('Failed to get student exam results', {
        error: error.message,
        enrollmentId,
        examId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get student results',
        error: error.message
      };
    }
  }

  /**
   * Get class results for an exam
   */
  async getClassExamResults(classId, sectionId, examId, schoolId) {
    try {
      const results = await ImprovedResult.getClassExamResults(classId, sectionId, examId, schoolId);
      
      return {
        success: true,
        data: results,
        totalStudents: results.length
      };

    } catch (error) {
      logger.error('Failed to get class exam results', {
        error: error.message,
        classId,
        sectionId,
        examId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get class results',
        error: error.message
      };
    }
  }

  /**
   * Get class exam statistics
   */
  async getClassExamStatistics(classId, sectionId, examId, schoolId) {
    try {
      const statistics = await ImprovedResult.getClassExamStatistics(classId, sectionId, examId, schoolId);
      
      return {
        success: true,
        data: statistics
      };

    } catch (error) {
      logger.error('Failed to get class exam statistics', {
        error: error.message,
        classId,
        sectionId,
        examId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get class statistics',
        error: error.message
      };
    }
  }

  /**
   * Get subject-wise performance for a class
   */
  async getSubjectPerformance(classId, sectionId, examId, schoolId) {
    try {
      const performance = await ImprovedResult.getSubjectPerformance(classId, sectionId, examId, schoolId);
      
      return {
        success: true,
        data: performance
      };

    } catch (error) {
      logger.error('Failed to get subject performance', {
        error: error.message,
        classId,
        sectionId,
        examId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get subject performance',
        error: error.message
      };
    }
  }

  /**
   * Submit results for verification
   */
  async submitResults(examId, classId, sectionId, schoolId, submittedBy) {
    try {
      const result = await ImprovedResult.updateMany(
        {
          examId,
          classId,
          sectionId,
          schoolId,
          status: 'draft'
        },
        {
          status: 'submitted',
          enteredBy: submittedBy
        }
      );

      return {
        success: true,
        message: 'Results submitted for verification',
        data: {
          modifiedCount: result.modifiedCount
        }
      };

    } catch (error) {
      logger.error('Failed to submit results', {
        error: error.message,
        examId,
        classId,
        sectionId,
        schoolId,
        submittedBy
      });
      
      return {
        success: false,
        message: 'Failed to submit results',
        error: error.message
      };
    }
  }

  /**
   * Verify results
   */
  async verifyResults(examId, classId, sectionId, schoolId, verifiedBy) {
    try {
      const result = await ImprovedResult.updateMany(
        {
          examId,
          classId,
          sectionId,
          schoolId,
          status: 'submitted'
        },
        {
          status: 'verified',
          verifiedBy,
          verifiedAt: new Date()
        }
      );

      return {
        success: true,
        message: 'Results verified successfully',
        data: {
          modifiedCount: result.modifiedCount
        }
      };

    } catch (error) {
      logger.error('Failed to verify results', {
        error: error.message,
        examId,
        classId,
        sectionId,
        schoolId,
        verifiedBy
      });
      
      return {
        success: false,
        message: 'Failed to verify results',
        error: error.message
      };
    }
  }

  /**
   * Publish results
   */
  async publishResults(examId, classId, sectionId, schoolId, publishedBy) {
    try {
      const result = await ImprovedResult.updateMany(
        {
          examId,
          classId,
          sectionId,
          schoolId,
          status: 'verified'
        },
        {
          status: 'published'
        }
      );

      return {
        success: true,
        message: 'Results published successfully',
        data: {
          modifiedCount: result.modifiedCount
        }
      };

    } catch (error) {
      logger.error('Failed to publish results', {
        error: error.message,
        examId,
        classId,
        sectionId,
        schoolId,
        publishedBy
      });
      
      return {
        success: false,
        message: 'Failed to publish results',
        error: error.message
      };
    }
  }

  /**
   * Get student's complete academic record
   */
  async getStudentAcademicRecord(enrollmentId, schoolId) {
    try {
      const results = await ImprovedResult.find({
        enrollmentId,
        schoolId,
        status: 'published'
      })
      .populate('examId', 'name examDate')
      .populate('subjects.subjectId', 'name code')
      .sort({ createdAt: 1 });

      return {
        success: true,
        data: results
      };

    } catch (error) {
      logger.error('Failed to get student academic record', {
        error: error.message,
        enrollmentId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get academic record',
        error: error.message
      };
    }
  }
}

module.exports = new MarkService();
