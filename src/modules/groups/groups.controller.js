const expressAsyncHandler = require('express-async-handler');
const Group = require('../../models/Group');

exports.createGroup = expressAsyncHandler(async (req, res) => {
  const group = await Group.create(req.body);
  res.status(201).json({ success: true, data: group });
});

exports.getGroups = expressAsyncHandler(async (req, res) => {
  const groups = await Group.find().populate('leaderUser', 'name email');
  res.status(200).json({ success: true, count: groups.length, data: groups });
});

exports.getGroup = expressAsyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate('leaderUser', 'name email');
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  res.status(200).json({ success: true, data: group });
});

exports.updateGroup = expressAsyncHandler(async (req, res) => {
  const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  res.status(200).json({ success: true, data: group });
});

exports.deleteGroup = expressAsyncHandler(async (req, res) => {
  const group = await Group.findByIdAndDelete(req.params.id);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  res.status(200).json({ success: true, data: {} });
});
