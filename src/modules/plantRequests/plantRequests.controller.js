const asyncHandler = require('express-async-handler');
const requestService = require('./plantRequests.service');

exports.createRequest = asyncHandler(async (req, res) => {
  const request = await requestService.createRequest(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Plant request submitted successfully',
    data: request,
    correlationId: req.correlationId
  });
});

exports.getRequests = asyncHandler(async (req, res) => {
  const requests = await requestService.getAllRequests(req.query);
  res.status(200).json({
    success: true,
    data: requests,
    correlationId: req.correlationId
  });
});

exports.getRequestById = asyncHandler(async (req, res) => {
  const request = await requestService.getRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  res.status(200).json({
    success: true,
    data: request,
    correlationId: req.correlationId
  });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const updatedRequest = await requestService.updateRequestStatus(req.params.id, status, remarks);
  res.status(200).json({
    success: true,
    message: 'Request status updated successfully',
    data: updatedRequest,
    correlationId: req.correlationId
  });
});
