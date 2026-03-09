const Class = require('../models/Class');

// Create a new class
const createClass = async (req, res) => {
  try {
    const { name } = req.body;

    const newClass = await Class.create({
      name,
      schoolId: req.user.schoolId, // Assign schoolId from logged-in user
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get all classes for the logged-in user's school
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ schoolId: req.user.schoolId, isActive: true });
    res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update class name
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedClass = await Class.findOneAndUpdate(
      { _id: id, schoolId: req.user.schoolId },
      { name },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Soft delete a class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClass = await Class.findOneAndUpdate(
      { _id: id, schoolId: req.user.schoolId },
      { isActive: false },
      { new: true }
    );

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  createClass,
  getClasses,
  updateClass,
  deleteClass,
};