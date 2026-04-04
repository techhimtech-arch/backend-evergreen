const Plant = require('../../models/Plant');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

// @desc    Get all plants
// @route   GET /api/v1/plants
// @access  Public/Private
exports.getPlants = async (req, res) => {
  try {
    const plants = await Plant.find();
    return sendSuccess(res, 200, 'Plants retrieved successfully', plants);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get single plant
// @route   GET /api/v1/plants/:id
// @access  Public/Private
exports.getPlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return sendNotFound(res, 'Plant not found');
    }
    return sendSuccess(res, 200, 'Plant found', plant);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Create new plant
// @route   POST /api/v1/plants
// @access  Private/Admin
exports.createPlant = async (req, res) => {
  try {
    const plant = await Plant.create(req.body);
    return sendSuccess(res, 201, 'Plant created successfully', plant);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Update plant
// @route   PUT /api/v1/plants/:id
// @access  Private/Admin
exports.updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!plant) {
      return sendNotFound(res, 'Plant not found');
    }
    return sendSuccess(res, 200, 'Plant updated successfully', plant);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Delete plant
// @route   DELETE /api/v1/plants/:id
// @access  Private/Admin
exports.deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);
    if (!plant) {
      return sendNotFound(res, 'Plant not found');
    }
    return sendSuccess(res, 200, 'Plant deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
