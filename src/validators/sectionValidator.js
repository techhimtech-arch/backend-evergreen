const { check, validationResult } = require('express-validator');

const validateSection = [
  check('name', 'Name is required').notEmpty(),
  check('classId', 'classId is required').notEmpty(),
  check('classId', 'Invalid classId').isMongoId(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateSection };