const Tree = require('../../models/Tree');
const { apiResponse } = require('../../utils/response');

// @desc    Get all trees (with pagination/filters)
// @route   GET /api/v1/trees
// @access  Public/Private
exports.getTrees = async (req, res) => {
  try {
    const trees = await Tree.find()
      .populate('plantTypeId', 'name scientificName category')
      .populate('plantedBy', 'name email');
    return apiResponse(res, 200, true, 'Trees retrieved', trees);
  } catch (error) {
    return apiResponse(res, 500, false, error.message);
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
    
    return apiResponse(res, 201, true, 'Tree registered successfully', tree);
  } catch (error) {
    return apiResponse(res, 400, false, error.message);
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
      return apiResponse(res, 404, false, 'Tree not found');
    }
    return apiResponse(res, 200, true, 'Tree found', tree);
  } catch (error) {
    return apiResponse(res, 500, false, error.message);
  }
};

// @desc    Update tree details (health/status etc)
// @route   PUT /api/v1/trees/:id
// @access  Private
exports.updateTree = async (req, res) => {
  try {
    const tree = await Tree.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!tree) {
      return apiResponse(res, 404, false, 'Tree not found');
    }
    return apiResponse(res, 200, true, 'Tree updated successfully', tree);
  } catch (error) {
    return apiResponse(res, 400, false, error.message);
  }
};

// @desc    Delete tree record (Admin typically)
// @route   DELETE /api/v1/trees/:id
// @access  Private/Admin
exports.deleteTree = async (req, res) => {
  try {
    const tree = await Tree.findByIdAndDelete(req.params.id);
    if (!tree) {
      return apiResponse(res, 404, false, 'Tree not found');
    }
    return apiResponse(res, 200, true, 'Tree deleted');
  } catch (error) {
    return apiResponse(res, 500, false, error.message);
  }
};
