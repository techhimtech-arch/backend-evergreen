const Plant = require('../../models/Plant');
const { apiResponse } = require('../../utils/response');

// @desc    Get all plants
// @route   GET /api/v1/plants
// @access  Public/Private
exports.getPlants = async (req, res) => {
  try {
    const plants = await Plant.find();
    return apiResponse(res, 200, true, 'Plants retrieved successfully', plants);
  } catch (error) {
    return apiResponse(res, 500, false, error.message);
  }
};

// @desc    Get single plant
// @route   GET /api/v1/plants/:id
// @access  Public/Private
exports.getPlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return apiResponse(res, 404, false, 'Plant not found');
    }
    return apiResponse(res, 200, true, 'Plant found', plant);
  } catch (error) {
    return apiResponse(res, 500, false, error.message);
  }
};

// @desc    Create new plant
// @route   POST /api/v1/plants
// @access  Private/Admin
exports.createPlant = async (req, res) => {
  try {
    const plant = await Plant.create(req.body);
    return apiResponse(res, 201, true, 'Plant created successfully', plant);
  } catch (error) {
    return apiResponse(res, 400, false, error.message);
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
      return apiResponse(res, 404, false, 'Plant not found');
    }
    return apiResponse(res, 200, true, 'Plant updated successfully', plant);
  } catch (error) {
    return apiResponse(res, 400, false, error.message);
  }
};

// @desc    Delete plant
// @route   DELETE /api/v1/plants/:id
// @access  Private/Admin
exports.deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);
    if (!plant) {
      return apiResponse(res, 404, false, 'Plant not found');
    }
    return apiResponse(res, 200, true, 'Plant deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, false, error.message);
  }
};
