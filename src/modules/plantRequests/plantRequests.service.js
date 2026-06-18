const PlantRequest = require('../../models/PlantRequest');

exports.createRequest = async (requestData, userId) => {
  const request = new PlantRequest({
    ...requestData,
    userId
  });
  return await request.save();
};

exports.getAllRequests = async (query = {}) => {
  return await PlantRequest.find(query)
    .populate('userId', 'name email')
    .populate('organizationId', 'name')
    .populate('groupId', 'groupName')
    .populate('requestedSpecies.plantTypeId', 'name scientificName');
};

exports.getRequestById = async (id) => {
  return await PlantRequest.findById(id)
    .populate('userId', 'name email')
    .populate('organizationId', 'name')
    .populate('groupId', 'groupName')
    .populate('requestedSpecies.plantTypeId', 'name scientificName');
};

exports.updateRequestStatus = async (id, status, remarks) => {
  const request = await PlantRequest.findById(id);
  if (!request) throw new Error('Plant request not found');

  request.status = status;
  if (remarks) request.remarks = remarks;
  
  return await request.save();
};
