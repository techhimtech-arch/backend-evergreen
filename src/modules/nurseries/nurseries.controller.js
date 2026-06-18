const asyncHandler = require('express-async-handler');
const nurseryService = require('./nurseries.service');

exports.createNursery = asyncHandler(async (req, res) => {
  const nursery = await nurseryService.createNursery(req.body);
  res.status(201).json({
    success: true,
    message: 'Nursery created successfully',
    data: nursery,
    correlationId: req.correlationId
  });
});

exports.getNurseries = asyncHandler(async (req, res) => {
  const nurseries = await nurseryService.getAllNurseries(req.query);
  res.status(200).json({
    success: true,
    data: nurseries,
    correlationId: req.correlationId
  });
});

exports.getNurseryById = asyncHandler(async (req, res) => {
  const nursery = await nurseryService.getNurseryById(req.params.id);
  if (!nursery) {
    return res.status(404).json({ success: false, message: 'Nursery not found' });
  }
  res.status(200).json({
    success: true,
    data: nursery,
    correlationId: req.correlationId
  });
});

exports.updateStock = asyncHandler(async (req, res) => {
  const { plantTypeId, quantity } = req.body;
  const updatedNursery = await nurseryService.updateNurseryStock(req.params.id, plantTypeId, quantity);
  res.status(200).json({
    success: true,
    message: 'Stock updated successfully',
    data: updatedNursery,
    correlationId: req.correlationId
  });
});
