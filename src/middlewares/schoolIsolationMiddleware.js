const schoolIsolationMiddleware = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    req.schoolFilter = { schoolId: req.user.schoolId };
  }
  next();
};

module.exports = schoolIsolationMiddleware;