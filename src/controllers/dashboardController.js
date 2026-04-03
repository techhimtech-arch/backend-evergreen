const mongoose = require('mongoose');
const User = require('../models/User');
const Group = require('../models/Group');
const Assignment = require('../models/Assignment');
const Organization = require('../models/Organization');
const logger = require('../utils/logger');

/**
 * @desc    Get dashboard statistics for Evergreen system
 * @route   GET /api/v1/dashboard
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res) => {
  try {
    // Determine the query conditionally if user is tied to an organization
    const orgQuery = req.user.role === 'superadmin' || req.user.userType === 'SUPER_ADMIN' 
      ? {} 
      : { organizationId: new mongoose.Types.ObjectId(req.user.organizationId || req.user.schoolId) };

    // Run parallel counts for performance
    const [
      totalUsers,
      totalGroups,
      totalAssignments,
      totalOrganizations,
      assignmentStats
    ] = await Promise.all([
      User.countDocuments(orgQuery),
      Group.countDocuments({ status: 'Active' }), // If custom filtering needed later
      Assignment.countDocuments({}),
      Organization.countDocuments({ status: 'ACTIVE' }),
      
      // Calculate some summary metrics out of Assignments (like total land area or target plants)
      Assignment.aggregate([
        {
          $group: {
            _id: null,
            totalLandArea: { $sum: '$landArea' },
            totalTargetPlants: { $sum: '$targetPlants' },
          },
        },
      ]),
    ]);

    const aggregateAssignmentStats = assignmentStats[0] || { totalLandArea: 0, totalTargetPlants: 0 };

    // Build analytical response payload
    const dashboardData = {
      stats: {
        totalUsers,
        totalGroups,
        totalAssignments,
        totalOrganizations
      },
      plantations: {
        totalLandAreaAllocated: aggregateAssignmentStats.totalLandArea,
        totalTargetPlants: aggregateAssignmentStats.totalTargetPlants
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    logger.error('Dashboard Error', { requestId: req.requestId, error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
