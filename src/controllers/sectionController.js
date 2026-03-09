const Section = require('../models/Section');
const Class = require('../models/Class');
const asyncHandler = require('express-async-handler');


// Create a new section
const createSection = asyncHandler(async (req, res) => {
  const { name, classId, capacity, roomNumber, floor, building } = req.body;

  // Validate classId belongs to the same school
  const classData = await Class.findOne({ _id: classId, schoolId: req.user.schoolId });
  if (!classData) {
    return res.status(400).json({ success: false, message: 'Invalid classId or unauthorized' });
  }

  // Create section with all fields
  const sectionData = {
    name,
    classId,
    schoolId: req.user.schoolId,
  };

  // Add optional fields if provided
  if (capacity !== undefined) sectionData.capacity = capacity;
  if (roomNumber) sectionData.roomNumber = roomNumber;
  if (floor) sectionData.floor = floor;
  if (building) sectionData.building = building;

  const section = await Section.create(sectionData);

  res.status(201).json({
    success: true,
    message: 'Section created successfully',
    data: section,
  });
});



// Get all active sections of the logged-in school
const getSections = asyncHandler(async (req, res) => {
  const sections = await Section.find({ schoolId: req.user.schoolId, isActive: true })
    .populate('classId', 'name');

  res.status(200).json({ success: true, data: sections });
});

// Get sections for a specific class
const getSectionsByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  // Validate class belongs to the same school
  const classData = await Class.findOne({ _id: classId, schoolId: req.user.schoolId });
  if (!classData) {
    return res.status(400).json({ success: false, message: 'Invalid classId or unauthorized' });
  }

  const sections = await Section.find({ schoolId: req.user.schoolId, classId, isActive: true })
    .populate('classId', 'name');

  res.status(200).json({ success: true, data: sections });
});



// Update a section
const updateSection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, capacity, roomNumber, floor, building } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (capacity !== undefined) updateData.capacity = capacity;
  if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
  if (floor !== undefined) updateData.floor = floor;
  if (building !== undefined) updateData.building = building;

  const section = await Section.findOneAndUpdate(
    { _id: id, schoolId: req.user.schoolId },
    updateData,
    { new: true }
  );

  if (!section) {
    return res.status(404).json({ success: false, message: 'Section not found or unauthorized' });
  }

  res.status(200).json({ success: true, message: 'Section updated successfully', data: section });
});


// Soft delete a section
const deleteSection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const section = await Section.findOneAndUpdate(
    { _id: id, schoolId: req.user.schoolId },
    { isActive: false },
    { new: true }
  );

  if (!section) {
    return res.status(404).json({ success: false, message: 'Section not found or unauthorized' });
  }

  res.status(200).json({ success: true, message: 'Section deleted successfully' });
});

module.exports = {
  createSection,
  getSections,
  getSectionsByClass,
  updateSection,
  deleteSection,
};