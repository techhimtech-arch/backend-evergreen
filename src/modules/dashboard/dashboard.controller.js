const expressAsyncHandler = require('express-async-handler');
const Group = require('../../models/Group');
const PlantationSite = require('../../models/PlantationSite');
const PlantationEntry = require('../../models/PlantationEntry');
const SurvivalReport = require('../../models/SurvivalReport');

exports.getDashboardStats = expressAsyncHandler(async (req, res) => {
  const totalGroups = await Group.countDocuments();
  const totalSites = await PlantationSite.countDocuments();
  
  // Aggregate total planted plants across all approved entries
  const totalPlantedResult = await PlantationEntry.aggregate([
    { $match: { verificationStatus: 'Verified' } },
    { $group: { _id: null, totalPlanted: { $sum: '$totalPlanted' } } }
  ]);
  const totalPlantsPlanted = totalPlantedResult.length > 0 ? totalPlantedResult[0].totalPlanted : 0;

  // Aggregate survival percentage safely
  const survivalAgg = await SurvivalReport.aggregate([
    { $group: {
        _id: null,
        totalLive: { $sum: '$livePlants' },
        totalDead: { $sum: '$deadPlants' }
      }
    }
  ]);
  
  let overallSurvivalPercentage = 0;
  if (survivalAgg.length > 0) {
    const total = survivalAgg[0].totalLive + survivalAgg[0].totalDead;
    if (total > 0) {
      overallSurvivalPercentage = (survivalAgg[0].totalLive / total) * 100;
    }
  }

  res.status(200).json({
    success: true,
    data: {
      totalGroups,
      totalPlantationSites: totalSites,
      totalPlantsPlanted,
      survivalPercentage: overallSurvivalPercentage.toFixed(2)
    }
  });
});
