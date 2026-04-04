const Tree = require('../../models/Tree');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

// @desc    Get all trees (with pagination/filters)
// @route   GET /api/v1/trees
// @access  Public/Private
exports.getTrees = async (req, res) => {
  try {
    const trees = await Tree.find()
      .populate('plantTypeId', 'name scientificName category')
      .populate('plantedBy', 'name email');
    return sendSuccess(res, 200, 'Trees retrieved', trees);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Register a new tree
// @route   POST /api/v1/trees
// @access  Private (authenticated user)
exports.registerTree = async (req, res) => {
  try {
    // Inject the logged-in user automatically as the planter
    const treeData = {
      ...req.body,
      plantedBy: req.user._id,
      plantedAt: Date.now()
    };
    
    const tree = await Tree.create(treeData);
    
    return sendSuccess(res, 201, 'Tree registered successfully', tree);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Get a single tree details
// @route   GET /api/v1/trees/:id
// @access  Public/Private
exports.getTree = async (req, res) => {
  try {
    const tree = await Tree.findById(req.params.id)
       .populate('plantTypeId', 'name scientificName category')
       .populate('plantedBy', 'name email');
       
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }
    return sendSuccess(res, 200, 'Tree found', tree);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update tree details (health/status etc)
// @route   PUT /api/v1/trees/:id
// @access  Private
exports.updateTree = async (req, res) => {
  try {
    const allowedFields = [
      'status', 'growthStage', 'healthRemarks', 'latitude', 'longitude',
      'location', 'lastInspectionDate', 'nextInspectionDate'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const tree = await Tree.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('plantTypeId', 'name scientificName category')
      .populate('plantedBy', 'firstName lastName email');

    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }
    return sendSuccess(res, 200, 'Tree updated successfully', tree);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Delete tree record (Admin typically)
// @route   DELETE /api/v1/trees/:id
// @access  Private/Admin
exports.deleteTree = async (req, res) => {
  try {
    const tree = await Tree.findByIdAndDelete(req.params.id);
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }
    return sendSuccess(res, 200, 'Tree deleted');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Add photo to tree
// @route   POST /api/v1/trees/:id/photos
// @access  Private
exports.addTreePhoto = async (req, res) => {
  try {
    const { url, caption } = req.body;

    if (!url) {
      return sendError(res, 400, 'Photo URL is required');
    }

    const tree = await Tree.findById(req.params.id);
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    const newPhoto = {
      url,
      caption: caption || '',
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    tree.photos.push(newPhoto);
    await tree.save();

    return sendSuccess(res, 200, 'Photo added successfully', tree);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Update tree health status
// @route   PATCH /api/v1/trees/:id/health
// @access  Private
exports.updateTreeHealth = async (req, res) => {
  try {
    const { status, growthStage, healthRemarks } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (growthStage) updateData.growthStage = growthStage;
    if (healthRemarks !== undefined) updateData.healthRemarks = healthRemarks;

    updateData.lastInspectionDate = new Date();

    const tree = await Tree.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('plantTypeId', 'name scientificName category')
      .populate('plantedBy', 'firstName lastName email');

    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    return sendSuccess(res, 200, 'Tree health updated successfully', tree);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Get trees by health status
// @route   GET /api/v1/trees/health/:status
// @access  Private
exports.getTreesByHealthStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['PLANTED', 'GROWING', 'HEALTHY', 'WEAK', 'DEAD'];

    if (!validStatuses.includes(status.toUpperCase())) {
      return sendError(res, 400, 'Invalid health status');
    }

    const trees = await Tree.find({ status: status.toUpperCase() })
      .populate('plantTypeId', 'name scientificName category')
      .populate('plantedBy', 'firstName lastName email')
      .sort({ plantedAt: -1 });

    return sendSuccess(res, 200, `Trees with ${status} status retrieved`, trees);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get trees needing inspection
// @route   GET /api/v1/trees/needing-inspection
// @access  Private
exports.getTreesNeedingInspection = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trees = await Tree.find({
      $or: [
        { lastInspectionDate: { $lt: thirtyDaysAgo } },
        { lastInspectionDate: { $exists: false } }
      ],
      status: { $ne: 'DEAD' }
    })
      .populate('plantTypeId', 'name scientificName category')
      .populate('plantedBy', 'firstName lastName email')
      .sort({ plantedAt: -1 });

    return sendSuccess(res, 200, 'Trees needing inspection retrieved', trees);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
