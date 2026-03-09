const AcademicYear = require('../models/AcademicYear');
const ErrorResponse = require('./errorResponse');

/**
 * Get current academic year for a school or throw a 400 error
 */
const getCurrentAcademicYearOrThrow = async (schoolId) => {
  const currentYear = await AcademicYear.getCurrentYear(schoolId);

  if (!currentYear) {
    throw new ErrorResponse(
      'No current academic year is set for this school. Please create and set one before using this feature.',
      400
    );
  }

  return currentYear;
};

module.exports = {
  getCurrentAcademicYearOrThrow,
};

