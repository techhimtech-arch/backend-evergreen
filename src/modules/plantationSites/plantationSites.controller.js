const expressAsyncHandler = require('express-async-handler');
const PlantationSite = require('../../models/PlantationSite');

exports.createSite = expressAsyncHandler(async (req, res) => {
  req.body.assignedBy = req.user ? req.user.id : null; // Pending auth integration
  const site = await PlantationSite.create(req.body);
  res.status(201).json({ success: true, data: site });
});

exports.getSites = expressAsyncHandler(async (req, res) => {
  const sites = await PlantationSite.find()
    .populate('assignedGroup', 'name type')
    .populate('assignedBy', 'name email');
  res.status(200).json({ success: true, count: sites.length, data: sites });
});

exports.getSite = expressAsyncHandler(async (req, res) => {
  const site = await PlantationSite.findById(req.params.id)
    .populate('assignedGroup')
    .populate('assignedBy');
  if (!site) return res.status(404).json({ success: false, message: 'Site not found' });
  res.status(200).json({ success: true, data: site });
});
