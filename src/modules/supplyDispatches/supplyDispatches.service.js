const SupplyDispatch = require('../../models/SupplyDispatch');
const PlantRequest = require('../../models/PlantRequest');
const nurseryService = require('../nurseries/nurseries.service');

exports.createDispatch = async (dispatchData) => {
  // Deduct stock from nursery. This will throw an error if stock is insufficient.
  await nurseryService.deductNurseryStock(dispatchData.nurseryId, dispatchData.plants);

  // Create dispatch record
  const dispatch = new SupplyDispatch(dispatchData);
  await dispatch.save();

  // If this fulfills a plant request, update the request status
  if (dispatchData.requestId) {
    await PlantRequest.findByIdAndUpdate(dispatchData.requestId, { status: 'FULFILLED' });
  }

  return dispatch;
};

exports.getAllDispatches = async (query = {}) => {
  return await SupplyDispatch.find(query)
    .populate('nurseryId', 'name location')
    .populate('receiverId', 'name email')
    .populate('requestId', 'purpose status')
    .populate('plants.plantTypeId', 'name scientificName');
};

exports.getDispatchById = async (id) => {
  return await SupplyDispatch.findById(id)
    .populate('nurseryId', 'name location')
    .populate('receiverId', 'name email')
    .populate('requestId', 'purpose status')
    .populate('plants.plantTypeId', 'name scientificName');
};

exports.updateDispatchStatus = async (id, status, remarks) => {
  const dispatch = await SupplyDispatch.findById(id);
  if (!dispatch) throw new Error('Dispatch record not found');

  dispatch.status = status;
  if (remarks) dispatch.remarks = remarks;
  
  return await dispatch.save();
};
