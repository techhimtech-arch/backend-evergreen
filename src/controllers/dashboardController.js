const mongoose = require('mongoose');
const User = require('../models/User');
const Group = require('../models/Group');
const Assignment = require('../models/Assignment');
const Organization = require('../models/Organization');
const Tree = require('../models/Tree');
const Inspection = require('../models/Inspection');
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
      assignmentStats,
      treeStats,
      inspectionStats
    ] = await Promise.all([
      User.countDocuments(orgQuery),
      Group.countDocuments({ status: 'Active' }),
      Assignment.countDocuments({}),
      Organization.countDocuments({ status: 'ACTIVE' }),

      // Assignment summary metrics
      Assignment.aggregate([
        {
          $group: {
            _id: null,
            totalLandArea: { $sum: '$landArea' },
            totalTargetPlants: { $sum: '$targetPlants' },
          },
        },
      ]),

      // Tree statistics for Phase 2
      Tree.aggregate([
        {
          $group: {
            _id: null,
            totalTrees: { $sum: 1 },
            healthyTrees: {
              $sum: { $cond: [{ $eq: ['$status', 'HEALTHY'] }, 1, 0] }
            },
            weakTrees: {
              $sum: { $cond: [{ $eq: ['$status', 'WEAK'] }, 1, 0] }
            },
            deadTrees: {
              $sum: { $cond: [{ $eq: ['$status', 'DEAD'] }, 1, 0] }
            },
            totalPhotos: { $sum: { $size: '$photos' } }
          }
        }
      ]),

      // Inspection statistics for Phase 2
      Inspection.aggregate([
        {
          $group: {
            _id: null,
            totalInspections: { $sum: 1 },
            completedInspections: {
              $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
            },
            pendingInspections: {
              $sum: { $cond: [{ $in: ['$status', ['PENDING', 'IN_PROGRESS']] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const aggregateAssignmentStats = assignmentStats[0] || { totalLandArea: 0, totalTargetPlants: 0 };
    const aggregateTreeStats = treeStats[0] || { totalTrees: 0, healthyTrees: 0, weakTrees: 0, deadTrees: 0, totalPhotos: 0 };
    const aggregateInspectionStats = inspectionStats[0] || { totalInspections: 0, completedInspections: 0, pendingInspections: 0 };

    // Calculate survival rate
    const survivalRate = aggregateTreeStats.totalTrees > 0
      ? ((aggregateTreeStats.totalTrees - aggregateTreeStats.deadTrees) / aggregateTreeStats.totalTrees * 100).toFixed(1)
      : 0;

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
      },
      // Phase 2: Tree Monitoring Statistics
      trees: {
        totalTrees: aggregateTreeStats.totalTrees,
        healthyTrees: aggregateTreeStats.healthyTrees,
        weakTrees: aggregateTreeStats.weakTrees,
        deadTrees: aggregateTreeStats.deadTrees,
        survivalRate: parseFloat(survivalRate),
        totalPhotos: aggregateTreeStats.totalPhotos
      },
      inspections: {
        totalInspections: aggregateInspectionStats.totalInspections,
        completedInspections: aggregateInspectionStats.completedInspections,
        pendingInspections: aggregateInspectionStats.pendingInspections,
        completionRate: aggregateInspectionStats.totalInspections > 0
          ? ((aggregateInspectionStats.completedInspections / aggregateInspectionStats.totalInspections) * 100).toFixed(1)
          : 0
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
