const expressAsyncHandler = require('express-async-handler');
const PlantationEntry = require('../../models/PlantationEntry');
const PlantationSite = require('../../models/PlantationSite');

exports.createEntry = expressAsyncHandler(async (req, res) => {
  req.body.submittedBy = req.user ? req.user.id : null;
  const entry = await PlantationEntry.create(req.body);
  res.status(201).json({ success: true, data: entry });
});

exports.getEntries = expressAsyncHandler(async (req, res) => {
  const entries = await PlantationEntry.find()
    .populate('site', 'areaName plantationTarget')
    .populate('group', 'name')
    .populate('submittedBy', 'name');
  res.status(200).json({ success: true, count: entries.length, data: entries });
});

exports.getEntry = expressAsyncHandler(async (req, res) => {
  const entry = await PlantationEntry.findById(req.params.id)
    .populate('site')
    .populate('group')
    .populate('submittedBy');
  if (!entry) return res.status(404).json({ success: false, message: 'Plantation entry not found' });
  res.status(200).json({ success: true, data: entry });
});
