const TreeMonitoring = require('../../models/TreeMonitoring');
const Tree = require('../../models/Tree');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

// @desc    Create new tree monitoring record
// @route   POST /api/v1/tree-monitoring
// @access  Private
exports.createTreeMonitoring = async (req, res) => {
  try {
    const { treeId, ...monitoringData } = req.body;

    // Validate tree exists
    const tree = await Tree.findById(treeId);
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    // Create monitoring record with logged-in user
    const monitoringRecord = await TreeMonitoring.create({
      treeId,
      updatedBy: req.user._id,
      ...monitoringData
    });

    // Update tree's last inspection date
    await Tree.findByIdAndUpdate(treeId, {
      lastInspectionDate: new Date(),
      nextInspectionDate: monitoringData.nextActionDate || null
    });

    // Populate for response
    await monitoringRecord.populate([
      { path: 'treeId', select: 'treeId status growthStage' },
      { path: 'updatedBy', select: 'firstName lastName email' }
    ]);

    return sendSuccess(res, 201, 'Tree monitoring record created successfully', monitoringRecord);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Get monitoring records for a specific tree
// @route   GET /api/v1/tree-monitoring/tree/:treeId
// @access  Private
exports.getTreeMonitoringByTreeId = async (req, res) => {
  try {
    const { treeId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate tree exists
    const tree = await Tree.findById(treeId);
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    const monitoringRecords = await TreeMonitoring.find({ treeId })
      .populate('updatedBy', 'firstName lastName email')
      .sort({ inspectionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TreeMonitoring.countDocuments({ treeId });

    return sendSuccess(res, 200, 'Tree monitoring records retrieved', {
      monitoringRecords,
      tree: {
        treeId: tree.treeId,
        status: tree.status,
        growthStage: tree.growthStage
      },
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get a specific monitoring record
// @route   GET /api/v1/tree-monitoring/:id
// @access  Private
exports.getTreeMonitoring = async (req, res) => {
  try {
    const monitoringRecord = await TreeMonitoring.findById(req.params.id)
      .populate('treeId', 'treeId status growthStage')
      .populate('updatedBy', 'firstName lastName email');

    if (!monitoringRecord) {
      return sendNotFound(res, 'Monitoring record not found');
    }

    return sendSuccess(res, 200, 'Monitoring record found', monitoringRecord);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update monitoring record
// @route   PATCH /api/v1/tree-monitoring/:id
// @access  Private
exports.updateTreeMonitoring = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const monitoringRecord = await TreeMonitoring.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('treeId', 'treeId status growthStage')
      .populate('updatedBy', 'firstName lastName email');

    if (!monitoringRecord) {
      return sendNotFound(res, 'Monitoring record not found');
    }

    return sendSuccess(res, 200, 'Monitoring record updated successfully', monitoringRecord);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Delete monitoring record
// @route   DELETE /api/v1/tree-monitoring/:id
// @access  Private/Admin
exports.deleteTreeMonitoring = async (req, res) => {
  try {
    const monitoringRecord = await TreeMonitoring.findByIdAndDelete(req.params.id);

    if (!monitoringRecord) {
      return sendNotFound(res, 'Monitoring record not found');
    }

    return sendSuccess(res, 200, 'Monitoring record deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get monitoring records by status
// @route   GET /api/v1/tree-monitoring/status/:status
// @access  Private
exports.getMonitoringByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const validStatuses = ['PLANTED', 'GROWING', 'HEALTHY', 'WEAK', 'DEAD'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return sendError(res, 400, 'Invalid status');
    }

    const monitoringRecords = await TreeMonitoring.find({ status: status.toUpperCase() })
      .populate('treeId', 'treeId')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ inspectionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TreeMonitoring.countDocuments({ status: status.toUpperCase() });

    return sendSuccess(res, 200, `Monitoring records with ${status} status retrieved`, {
      monitoringRecords,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get monitoring records by growth stage
// @route   GET /api/v1/tree-monitoring/growth-stage/:stage
// @access  Private
exports.getMonitoringByGrowthStage = async (req, res) => {
  try {
    const { stage } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const validStages = ['SEEDLING', 'SAPLING', 'YOUNG', 'MATURE'];
    if (!validStages.includes(stage.toUpperCase())) {
      return sendError(res, 400, 'Invalid growth stage');
    }

    const monitoringRecords = await TreeMonitoring.find({ growthStage: stage.toUpperCase() })
      .populate('treeId', 'treeId')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ inspectionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TreeMonitoring.countDocuments({ growthStage: stage.toUpperCase() });

    return sendSuccess(res, 200, `Monitoring records with ${stage} growth stage retrieved`, {
      monitoringRecords,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get monitoring records needing attention (high priority)
// @route   GET /api/v1/tree-monitoring/needing-attention
// @access  Private
exports.getMonitoringNeedingAttention = async (req, res) => {
  try {
    const monitoringRecords = await TreeMonitoring.find({
      $or: [
        { priority: 'HIGH' },
        { priority: 'CRITICAL' },
        { status: 'WEAK' },
        { status: 'DEAD' },
        { nextActionDate: { $lte: new Date() } }
      ]
    })
      .populate('treeId', 'treeId status growthStage')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ priority: -1, nextActionDate: 1 });

    return sendSuccess(res, 200, 'Monitoring records needing attention retrieved', monitoringRecords);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
