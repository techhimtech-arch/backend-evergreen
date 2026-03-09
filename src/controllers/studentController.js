const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const studentService = require('../services/studentService');
const csvService = require('../services/csvService');

// Create a new student
const createStudent = asyncHandler(async (req, res) => {
  try {
    const { schoolId, role, _id: userId } = req.user;
    const student = await studentService.createStudent(req.body, schoolId, { role, userId });
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    logger.error('Error in createStudent', { requestId: req.requestId, error: error.message });
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// Fetch all students for the logged-in user's school (with pagination)
const getStudents = asyncHandler(async (req, res) => {
  try {
    const { schoolId, role, _id: userId } = req.user;
    const { page, limit, classId, sectionId, search } = req.query;

    const result = await studentService.getStudents(schoolId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      role,
      userId,
      classId,
      sectionId,
      search
    });

    res.status(200).json({
      success: true,
      count: result.students.length,
      page: result.pagination.page,
      totalPages: result.pagination.totalPages,
      total: result.pagination.total,
      data: result.students
    });
  } catch (error) {
    logger.error('Error fetching students', { requestId: req.requestId, error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single student by ID
const getStudentById = asyncHandler(async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id, req.user.schoolId);
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
});

// Update student
const updateStudent = asyncHandler(async (req, res) => {
  try {
    const student = await studentService.updateStudent(
      req.params.id, 
      req.user.schoolId, 
      req.body
    );
    
    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
});

// Soft delete student
const deleteStudent = asyncHandler(async (req, res) => {
  try {
    const result = await studentService.deleteStudent(req.params.id, req.user.schoolId);
    
    logger.info('Student soft deleted', { 
      requestId: req.requestId, 
      studentId: req.params.id, 
      schoolId: req.user.schoolId 
    });
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
});

// Bulk import students from CSV
const bulkImportStudents = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No CSV file uploaded' 
      });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    
    // Parse CSV
    const requiredHeaders = ['admissionnumber', 'firstname', 'classid', 'sectionid'];
    const parsed = csvService.parseCSV(csvContent, requiredHeaders);

    if (parsed.errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV validation failed',
        errors: parsed.errors
      });
    }

    // Validate each row
    const validationErrors = [];
    parsed.data.forEach((row, index) => {
      const rowErrors = csvService.validateStudentRow(row, row._rowNumber || index + 2);
      validationErrors.push(...rowErrors);
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Data validation failed',
        errors: validationErrors
      });
    }

    // Import students
    const result = await studentService.bulkImportStudents(parsed.data, req.user.schoolId);

    logger.info('Bulk import completed', {
      requestId: req.requestId,
      schoolId: req.user.schoolId,
      success: result.success.length,
      failed: result.failed.length
    });

    res.status(200).json({
      success: true,
      message: `Import completed: ${result.success.length} successful, ${result.failed.length} failed`,
      data: result
    });
  } catch (error) {
    logger.error('Bulk import error', { requestId: req.requestId, error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Bulk import failed: ' + error.message 
    });
  }
});

// Get CSV template for student import
const getImportTemplate = asyncHandler(async (req, res) => {
  const template = csvService.generateStudentTemplate();
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=student_import_template.csv');
  res.status(200).send(template);
});

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
  getImportTemplate,
};