const { body, param } = require('express-validator');

const createSponsorValidation = [
  body('companyName').notEmpty().withMessage('Company Name is required'),
  body('contactPerson').notEmpty().withMessage('Contact Person is required'),
  body('email').isEmail().withMessage('Valid email is required')
];

const addFundValidation = [
  param('id').isMongoId().withMessage('Valid Sponsor ID is required'),
  body('fundingAmount').isNumeric().withMessage('Funding Amount must be a number'),
  body('plantsCount').isNumeric().withMessage('Plants Count must be a number')
];

const idValidation = [
  param('id').isMongoId().withMessage('Valid Sponsor ID is required')
];

module.exports = {
  createSponsorValidation,
  addFundValidation,
  idValidation
};
