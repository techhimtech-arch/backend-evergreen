const AcademicYear = require('../models/AcademicYear');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const { logAudit } = require('../middlewares/auditMiddleware');

/**
 * @desc    Create a new academic year
 * @route   POST /api/v1/academic-years
 * @access  Private (school_admin, superadmin)
 */
exports.createAcademicYear = asyncHandler(async (req, res, next) => {
  const { name, startDate, endDate, terms, holidays, settings, description, isCurrent } = req.body;
  const { schoolId } = req.user;

  // Check if academic year with same name exists
  const existingYear = await AcademicYear.findOne({ name, schoolId });
  if (existingYear) {
    return next(new ErrorResponse('Academic year with this name already exists', 400));
  }

  const academicYear = await AcademicYear.create({
    name,
    schoolId,
    startDate,
    endDate,
    terms,
    holidays,
    settings,
    description,
    isCurrent: isCurrent || false,
  });

  // Audit log
  await logAudit({
    req,
    action: 'ACADEMIC_YEAR_CREATE',
    resourceType: 'AcademicYear',
    resourceId: academicYear._id,
    newValues: { name, startDate, endDate },
    description: `Created academic year: ${name}`,
  });

  res.status(201).json({
    success: true,
    message: 'Academic year created successfully',
    data: academicYear,
  });
});

/**
 * @desc    Get all academic years for a school
 * @route   GET /api/v1/academic-years
 * @access  Private
 */
exports.getAllAcademicYears = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.user;
  const { isActive } = req.query;

  const query = { schoolId };
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const academicYears = await AcademicYear.find(query)
    .sort({ startDate: -1 });

  res.status(200).json({
    success: true,
    count: academicYears.length,
    data: academicYears,
  });
});

/**
 * @desc    Get current academic year
 * @route   GET /api/v1/academic-years/current
 * @access  Private
 */
exports.getCurrentAcademicYear = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.user;

  const currentYear = await AcademicYear.getCurrentYear(schoolId);

  if (!currentYear) {
    return next(new ErrorResponse('No current academic year set', 404));
  }

  res.status(200).json({
    success: true,
    data: currentYear,
  });
});

/**
 * @desc    Get single academic year
 * @route   GET /api/v1/academic-years/:id
 * @access  Private
 */
exports.getAcademicYear = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { schoolId } = req.user;

  const academicYear = await AcademicYear.findOne({ _id: id, schoolId });

  if (!academicYear) {
    return next(new ErrorResponse('Academic year not found', 404));
  }

  res.status(200).json({
    success: true,
    data: academicYear,
  });
});

/**
 * @desc    Update academic year
 * @route   PUT /api/v1/academic-years/:id
 * @access  Private (school_admin, superadmin)
 */
exports.updateAcademicYear = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { schoolId } = req.user;
  const { name, startDate, endDate, terms, holidays, settings, description, isActive } = req.body;

  let academicYear = await AcademicYear.findOne({ _id: id, schoolId });

  if (!academicYear) {
    return next(new ErrorResponse('Academic year not found', 404));
  }

  const previousValues = {
    name: academicYear.name,
    startDate: academicYear.startDate,
    endDate: academicYear.endDate,
  };

  // Update fields
  if (name) academicYear.name = name;
  if (startDate) academicYear.startDate = startDate;
  if (endDate) academicYear.endDate = endDate;
  if (terms) academicYear.terms = terms;
  if (holidays) academicYear.holidays = holidays;
  if (settings) academicYear.settings = { ...academicYear.settings, ...settings };
  if (description !== undefined) academicYear.description = description;
  if (isActive !== undefined) academicYear.isActive = isActive;

  await academicYear.save();

  // Audit log
  await logAudit({
    req,
    action: 'ACADEMIC_YEAR_UPDATE',
    resourceType: 'AcademicYear',
    resourceId: academicYear._id,
    previousValues,
    newValues: { name, startDate, endDate },
    description: `Updated academic year: ${academicYear.name}`,
  });

  res.status(200).json({
    success: true,
    message: 'Academic year updated successfully',
    data: academicYear,
  });
});

/**
 * @desc    Set current academic year
 * @route   PUT /api/v1/academic-years/:id/set-current
 * @access  Private (school_admin, superadmin)
 */
exports.setCurrentAcademicYear = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { schoolId } = req.user;

  // Verify the academic year exists and belongs to the school
  const academicYear = await AcademicYear.findOne({ _id: id, schoolId });

  if (!academicYear) {
    return next(new ErrorResponse('Academic year not found', 404));
  }

  if (!academicYear.isActive) {
    return next(new ErrorResponse('Cannot set an inactive academic year as current', 400));
  }

  // Set as current
  const updatedYear = await AcademicYear.setCurrentYear(id, schoolId);

  // Audit log
  await logAudit({
    req,
    action: 'ACADEMIC_YEAR_SET_CURRENT',
    resourceType: 'AcademicYear',
    resourceId: updatedYear._id,
    description: `Set academic year as current: ${updatedYear.name}`,
  });

  res.status(200).json({
    success: true,
    message: 'Current academic year updated successfully',
    data: updatedYear,
  });
});

/**
 * @desc    Add term to academic year
 * @route   POST /api/v1/academic-years/:id/terms
 * @access  Private (school_admin, superadmin)
 */
exports.addTerm = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { schoolId } = req.user;
  const { name, startDate, endDate } = req.body;

  const academicYear = await AcademicYear.findOne({ _id: id, schoolId });

  if (!academicYear) {
    return next(new ErrorResponse('Academic year not found', 404));
  }

  academicYear.terms.push({ name, startDate, endDate });
  await academicYear.save();

  res.status(200).json({
    success: true,
    message: 'Term added successfully',
    data: academicYear,
  });
});

/**
 * @desc    Add holiday to academic year
 * @route   POST /api/v1/academic-years/:id/holidays
 * @access  Private (school_admin, superadmin)
 */
exports.addHoliday = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { schoolId } = req.user;
  const { name, startDate, endDate, description } = req.body;

  const academicYear = await AcademicYear.findOne({ _id: id, schoolId });

  if (!academicYear) {
    return next(new ErrorResponse('Academic year not found', 404));
  }

  academicYear.holidays.push({ name, startDate, endDate, description });
  await academicYear.save();

  res.status(200).json({
    success: true,
    message: 'Holiday added successfully',
    data: academicYear,
  });
});

/**
 * @desc    Delete academic year (soft delete)
 * @route   DELETE /api/v1/academic-years/:id
 * @access  Private (school_admin, superadmin)
 */
exports.deleteAcademicYear = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { schoolId } = req.user;

  const academicYear = await AcademicYear.findOne({ _id: id, schoolId });

  if (!academicYear) {
    return next(new ErrorResponse('Academic year not found', 404));
  }

  if (academicYear.isCurrent) {
    return next(new ErrorResponse('Cannot delete the current academic year. Set another year as current first.', 400));
  }

  academicYear.isActive = false;
  await academicYear.save();

  // Audit log
  await logAudit({
    req,
    action: 'ACADEMIC_YEAR_UPDATE',
    resourceType: 'AcademicYear',
    resourceId: academicYear._id,
    description: `Deactivated academic year: ${academicYear.name}`,
  });

  res.status(200).json({
    success: true,
    message: 'Academic year deleted successfully',
  });
});
