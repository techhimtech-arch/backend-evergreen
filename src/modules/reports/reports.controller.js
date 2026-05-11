const Tree = require('../../models/Tree');
const Organization = require('../../models/Organization');
const Group = require('../../models/Group');
const Assignment = require('../../models/Assignment');
const User = require('../../models/User');
const { sendSuccess, sendError } = require('../../utils/response');

/**
 * @desc    Get summary report with org-wise plantation data
 * @route   GET /api/v1/reports/summary
 * @access  Private
 */
exports.getSummaryReport = async (req, res) => {
  try {
    const { startDate, endDate, organizationId } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const treeFilter = {};
    if (Object.keys(dateFilter).length > 0) treeFilter.plantedDate = dateFilter;

    // Organization-wise tree counts via aggregation
    const orgWiseTrees = await Tree.aggregate([
      { $match: treeFilter },
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignmentId',
          foreignField: '_id',
          as: 'assignment'
        }
      },
      { $unwind: { path: '$assignment', preserveNullAndEmpty: true } },
      {
        $lookup: {
          from: 'organizations',
          localField: 'assignment.organizationId',
          foreignField: '_id',
          as: 'organization'
        }
      },
      { $unwind: { path: '$organization', preserveNullAndEmpty: true } },
      {
        $group: {
          _id: '$organization._id',
          organizationName: { $first: '$organization.name' },
          organizationType: { $first: '$organization.type' },
          totalTrees: { $sum: 1 },
          healthyTrees: { $sum: { $cond: [{ $eq: ['$status', 'HEALTHY'] }, 1, 0] } },
          weakTrees: { $sum: { $cond: [{ $eq: ['$status', 'WEAK'] }, 1, 0] } },
          deadTrees: { $sum: { $cond: [{ $eq: ['$status', 'DEAD'] }, 1, 0] } },
          plantedTrees: { $sum: { $cond: [{ $eq: ['$status', 'PLANTED'] }, 1, 0] } },
          growingTrees: { $sum: { $cond: [{ $eq: ['$status', 'GROWING'] }, 1, 0] } },
        }
      },
      {
        $addFields: {
          survivalRate: {
            $cond: [
              { $gt: ['$totalTrees', 0] },
              {
                $multiply: [
                  { $divide: [{ $subtract: ['$totalTrees', '$deadTrees'] }, '$totalTrees'] },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { totalTrees: -1 } }
    ]);

    // Monthly tree registration trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrend = await Tree.aggregate([
      { $match: { plantedDate: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$plantedDate' },
            month: { $month: '$plantedDate' }
          },
          treesPlanted: { $sum: 1 },
          healthyTrees: { $sum: { $cond: [{ $eq: ['$status', 'HEALTHY'] }, 1, 0] } },
          deadTrees: { $sum: { $cond: [{ $eq: ['$status', 'DEAD'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Species-wise distribution
    const speciesDistribution = await Tree.aggregate([
      { $match: treeFilter },
      {
        $lookup: {
          from: 'plants',
          localField: 'speciesId',
          foreignField: '_id',
          as: 'species'
        }
      },
      { $unwind: { path: '$species', preserveNullAndEmpty: true } },
      {
        $group: {
          _id: '$species._id',
          speciesName: { $first: '$species.name' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Overall summary numbers
    const totalTrees = await Tree.countDocuments(treeFilter);
    const totalOrganizations = await Organization.countDocuments({ status: 'ACTIVE' });
    const totalUsers = await User.countDocuments({ status: 'ACTIVE' });
    const totalAssignments = await Assignment.countDocuments({});

    const treeStatusCounts = await Tree.aggregate([
      { $match: treeFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = treeStatusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const deadCount = statusMap['DEAD'] || 0;
    const survivalRate = totalTrees > 0
      ? ((totalTrees - deadCount) / totalTrees * 100).toFixed(1)
      : 0;

    return sendSuccess(res, 200, 'Summary report generated successfully', {
      overview: {
        totalTrees,
        totalOrganizations,
        totalUsers,
        totalAssignments,
        survivalRate: parseFloat(survivalRate),
        treesByStatus: statusMap
      },
      organizationWise: orgWiseTrees,
      monthlyTrend,
      speciesDistribution,
      generatedAt: new Date().toISOString(),
      filters: { startDate, endDate, organizationId }
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Get group-wise report
 * @route   GET /api/v1/reports/groups
 * @access  Private
 */
exports.getGroupReport = async (req, res) => {
  try {
    const groupWiseTrees = await Tree.aggregate([
      {
        $lookup: {
          from: 'groups',
          localField: 'groupId',
          foreignField: '_id',
          as: 'group'
        }
      },
      { $unwind: { path: '$group', preserveNullAndEmpty: true } },
      {
        $group: {
          _id: '$group._id',
          groupName: { $first: '$group.groupName' },
          village: { $first: '$group.village' },
          district: { $first: '$group.district' },
          totalTrees: { $sum: 1 },
          healthyTrees: { $sum: { $cond: [{ $eq: ['$status', 'HEALTHY'] }, 1, 0] } },
          deadTrees: { $sum: { $cond: [{ $eq: ['$status', 'DEAD'] }, 1, 0] } },
        }
      },
      {
        $addFields: {
          survivalRate: {
            $cond: [
              { $gt: ['$totalTrees', 0] },
              {
                $multiply: [
                  { $divide: [{ $subtract: ['$totalTrees', '$deadTrees'] }, '$totalTrees'] },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { totalTrees: -1 } }
    ]);

    return sendSuccess(res, 200, 'Group report generated successfully', { groups: groupWiseTrees });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
