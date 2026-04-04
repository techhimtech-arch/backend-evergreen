const Inspection = require('../../models/Inspection');
const Tree = require('../../models/Tree');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

// @desc    Get all inspections (with filters)
// @route   GET /api/v1/inspections
// @access  Private
exports.getInspections = async (req, res) => {
  try {
    const { status, inspectorId, treeId, priority } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (inspectorId) filter.inspectorId = inspectorId;
    if (treeId) filter.treeId = treeId;
    if (priority) filter.priority = priority;

    const inspections = await Inspection.find(filter)
      .populate('treeId', 'location status growthStage')
      .populate('inspectorId', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName')
      .sort({ scheduledDate: 1 });

    return sendSuccess(res, 200, 'Inspections retrieved', inspections);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get single inspection
// @route   GET /api/v1/inspections/:id
// @access  Private
exports.getInspection = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('treeId')
      .populate('inspectorId', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName');

    if (!inspection) {
      return sendNotFound(res, 'Inspection not found');
    }

    return sendSuccess(res, 200, 'Inspection found', inspection);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Create new inspection
// @route   POST /api/v1/inspections
// @access  Private
exports.createInspection = async (req, res) => {
  try {
    const inspectionData = {
      ...req.body,
      assignedBy: req.user._id
    };

    // Verify tree exists
    const tree = await Tree.findById(inspectionData.treeId);
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    const inspection = await Inspection.create(inspectionData);

    // Update tree's next inspection date
    await Tree.findByIdAndUpdate(tree._id, {
      nextInspectionDate: inspectionData.scheduledDate
    });

    return sendSuccess(res, 201, 'Inspection created successfully', inspection);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Update inspection
// @route   PUT /api/v1/inspections/:id
// @access  Private
exports.updateInspection = async (req, res) => {
  try {
    const inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!inspection) {
      return sendNotFound(res, 'Inspection not found');
    }

    return sendSuccess(res, 200, 'Inspection updated successfully', inspection);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Complete inspection with findings
// @route   PATCH /api/v1/inspections/:id/complete
// @access  Private
exports.completeInspection = async (req, res) => {
  try {
    const { treeStatus, growthStage, healthScore, remarks, photos, recommendedActions } = req.body;

    const inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      {
        status: 'COMPLETED',
        completedDate: new Date(),
        treeStatus,
        growthStage,
        healthScore,
        remarks,
        photos,
        recommendedActions
      },
      { new: true }
    );

    if (!inspection) {
      return sendNotFound(res, 'Inspection not found');
    }

    // Update tree with latest inspection data
    await Tree.findByIdAndUpdate(inspection.treeId, {
      status: treeStatus,
      growthStage: growthStage,
      healthRemarks: remarks,
      lastInspectionDate: new Date(),
      // Add photos to tree's photo array
      $push: {
        photos: photos?.map(photo => ({
          url: photo.url,
          caption: photo.caption,
          uploadedBy: req.user._id
        })) || []
      }
    });

    return sendSuccess(res, 200, 'Inspection completed successfully', inspection);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Delete inspection
// @route   DELETE /api/v1/inspections/:id
// @access  Private/Admin
exports.deleteInspection = async (req, res) => {
  try {
    const inspection = await Inspection.findByIdAndDelete(req.params.id);

    if (!inspection) {
      return sendNotFound(res, 'Inspection not found');
    }

    return sendSuccess(res, 200, 'Inspection deleted');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get inspections for a specific tree
// @route   GET /api/v1/inspections/tree/:treeId
// @access  Private
exports.getInspectionsByTree = async (req, res) => {
  try {
    const inspections = await Inspection.find({ treeId: req.params.treeId })
      .populate('inspectorId', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName')
      .sort({ scheduledDate: -1 });

    return sendSuccess(res, 200, 'Tree inspections retrieved', inspections);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get pending inspections for current user
// @route   GET /api/v1/inspections/my-pending
// @access  Private
exports.getMyPendingInspections = async (req, res) => {
  try {
    const inspections = await Inspection.find({
      inspectorId: req.user._id,
      status: { $in: ['PENDING', 'IN_PROGRESS'] }
    })
      .populate('treeId', 'location status growthStage latitude longitude')
      .sort({ scheduledDate: 1 });

    return sendSuccess(res, 200, 'Pending inspections retrieved', inspections);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};