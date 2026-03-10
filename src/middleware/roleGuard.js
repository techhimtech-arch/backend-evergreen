/**
 * Role guard middleware — accepts an array of allowed roles.
 * Usage: roleGuard(['school_admin', 'teacher'])
 */
const roleGuard = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: You do not have the required role.',
      });
    }
    next();
  };
};

module.exports = roleGuard;