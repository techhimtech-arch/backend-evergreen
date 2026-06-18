const asyncHandler = require('express-async-handler');
const dispatchService = require('./supplyDispatches.service');

exports.createDispatch = asyncHandler(async (req, res) => {
  try {
    const dispatch = await dispatchService.createDispatch(req.body);
    res.status(201).json({
      success: true,
      message: 'Supply dispatched successfully',
      data: dispatch,
      correlationId: req.correlationId
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      correlationId: req.correlationId
    });
  }
});

exports.getDispatches = asyncHandler(async (req, res) => {
  const dispatches = await dispatchService.getAllDispatches(req.query);
  res.status(200).json({
    success: true,
    data: dispatches,
    correlationId: req.correlationId
  });
});

exports.getDispatchById = asyncHandler(async (req, res) => {
  const dispatch = await dispatchService.getDispatchById(req.params.id);
  if (!dispatch) {
    return res.status(404).json({ success: false, message: 'Dispatch record not found' });
  }
  res.status(200).json({
    success: true,
    data: dispatch,
    correlationId: req.correlationId
  });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const updatedDispatch = await dispatchService.updateDispatchStatus(req.params.id, status, remarks);
  res.status(200).json({
    success: true,
    message: 'Dispatch status updated successfully',
    data: updatedDispatch,
    correlationId: req.correlationId
  });
});
