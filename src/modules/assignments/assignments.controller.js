const expressAsyncHandler = require('express-async-handler');
const Assignment = require('../../models/Assignment');

exports.createAssignment = expressAsyncHandler(async (req, res) => {
  const assignment = await Assignment.create(req.body);
  res.status(201).json({ success: true, data: assignment });
});

exports.getAssignments = expressAsyncHandler(async (req, res) => {
  const assignments = await Assignment.find().populate('groupId');
  res.status(200).json({ success: true, count: assignments.length, data: assignments });
});

exports.getAssignment = expressAsyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate('groupId');
  if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
  res.status(200).json({ success: true, data: assignment });
});
