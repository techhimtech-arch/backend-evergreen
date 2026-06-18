const Nursery = require('../../models/Nursery');

exports.createNursery = async (nurseryData) => {
  const nursery = new Nursery(nurseryData);
  return await nursery.save();
};

exports.getAllNurseries = async (query = {}) => {
  return await Nursery.find(query).populate('managerId', 'name email').populate('organizationId', 'name');
};

exports.getNurseryById = async (id) => {
  return await Nursery.findById(id).populate('managerId', 'name email').populate('stock.plantTypeId', 'name scientificName');
};

exports.updateNurseryStock = async (nurseryId, plantTypeId, quantity) => {
  const nursery = await Nursery.findById(nurseryId);
  if (!nursery) throw new Error('Nursery not found');

  const stockIndex = nursery.stock.findIndex(s => s.plantTypeId.toString() === plantTypeId.toString());
  
  if (stockIndex > -1) {
    nursery.stock[stockIndex].quantity += quantity;
    if (nursery.stock[stockIndex].quantity < 0) nursery.stock[stockIndex].quantity = 0;
  } else {
    if (quantity > 0) {
      nursery.stock.push({ plantTypeId, quantity });
    }
  }

  return await nursery.save();
};

exports.deductNurseryStock = async (nurseryId, plantsArray) => {
  const nursery = await Nursery.findById(nurseryId);
  if (!nursery) throw new Error('Nursery not found');

  // Verify all requested stock is available
  for (const requestedPlant of plantsArray) {
    const stockItem = nursery.stock.find(s => s.plantTypeId.toString() === requestedPlant.plantTypeId.toString());
    if (!stockItem || stockItem.quantity < requestedPlant.quantity) {
      throw new Error(`Insufficient stock for plant type ${requestedPlant.plantTypeId}`);
    }
  }

  // Deduct stock
  for (const requestedPlant of plantsArray) {
    const stockIndex = nursery.stock.findIndex(s => s.plantTypeId.toString() === requestedPlant.plantTypeId.toString());
    nursery.stock[stockIndex].quantity -= requestedPlant.quantity;
  }

  return await nursery.save();
};
