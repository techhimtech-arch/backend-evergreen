const { body, param, query } = require('express-validator');

exports.createInspectionValidation = [
  body('treeId')
    .isMongoId()
    .withMessage('Valid tree ID is required'),

  body('inspectorId')
    .isMongoId()
    .withMessage('Valid inspector ID is required'),

  body('scheduledDate')
    .isISO8601()
    .withMessage('Valid scheduled date is required')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Scheduled date cannot be in the past');
      }
      return true;
    }),

  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Priority must be LOW, MEDIUM, HIGH, or CRITICAL')
];

exports.updateInspectionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid inspection ID is required'),

  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED'])
    .withMessage('Invalid status'),

  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Valid scheduled date is required'),

  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Priority must be LOW, MEDIUM, HIGH, or CRITICAL')
];

exports.completeInspectionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid inspection ID is required'),

  body('treeStatus')
    .isIn(['HEALTHY', 'WEAK', 'DEAD', 'NEEDS_ATTENTION'])
    .withMessage('Valid tree status is required'),

  body('growthStage')
    .optional()
    .isIn(['SEEDLING', 'SAPLING', 'YOUNG', 'MATURE', 'FLOWERING', 'FRUITING'])
    .withMessage('Valid growth stage is required'),

  body('healthScore')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Health score must be between 1 and 10'),

  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters'),

  body('recommendedActions')
    .optional()
    .isArray()
    .withMessage('Recommended actions must be an array'),

  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array')
];

exports.getInspectionsValidation = [
  query('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED'])
    .withMessage('Invalid status filter'),

  query('inspectorId')
    .optional()
    .isMongoId()
    .withMessage('Valid inspector ID is required'),

  query('treeId')
    .optional()
    .isMongoId()
    .withMessage('Valid tree ID is required'),

  query('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Invalid priority filter')
];

exports.idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid inspection ID is required')
];

exports.treeIdValidation = [
  param('treeId')
    .isMongoId()
    .withMessage('Valid tree ID is required')
];