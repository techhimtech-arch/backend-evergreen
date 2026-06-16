const ForestSite = require('../../models/ForestSite');
const AdoptionAgreement = require('../../models/AdoptionAgreement');
const Organization = require('../../models/Organization');
const Tree = require('../../models/Tree'); // Reusing existing Tree model
const { sendSuccess } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/error.middleware');

class PublicPortalController {
  getDashboardMetrics = asyncHandler(async (req, res) => {
    const totalSites = await ForestSite.countDocuments();
    const availableSites = await ForestSite.countDocuments({ status: 'AVAILABLE' });
    const adoptedSites = await ForestSite.countDocuments({ status: { $in: ['ADOPTED', 'ACTIVE', 'COMPLETED'] } });
    
    // Total trees planted in adopted sites (pseudo-logic since we link trees to assignments/agreements)
    // This would ideally sum up actualPlantsPlanted from Assignment model linked to AdoptionAgreements
    const totalTrees = await Tree.countDocuments({ isPlanted: true }); // Assuming global for now
    
    // CSR Contribution (sum of approved budgets)
    const agreements = await AdoptionAgreement.find({ status: 'ACTIVE' });
    const totalContribution = agreements.reduce((sum, ag) => sum + ag.approvedBudget, 0);

    return sendSuccess(res, 200, 'Public metrics retrieved', {
      totalSites,
      availableSites,
      adoptedSites,
      totalTrees,
      survivalPercentage: 85, // Placeholder, would compute from Monitoring
      totalContribution
    });
  });

  getAvailableSites = asyncHandler(async (req, res) => {
    const sites = await ForestSite.find({ status: 'AVAILABLE' })
      .select('siteName district village areaHectare beforePhotos description estimatedCost')
      .limit(20);
    return sendSuccess(res, 200, 'Available sites retrieved', sites);
  });

  getAdoptedSites = asyncHandler(async (req, res) => {
    const agreements = await AdoptionAgreement.find({ status: { $in: ['ACTIVE', 'COMPLETED'] } })
      .populate('siteId', 'siteName district village areaHectare latitude longitude geoBoundary beforePhotos')
      .populate('organizationId', 'name logo website')
      .select('approvedBudget durationYears startDate');
      
    return sendSuccess(res, 200, 'Adopted sites retrieved', agreements);
  });

  getCSRPartners = asyncHandler(async (req, res) => {
    const partners = await Organization.find({ organizationType: { $in: ['CSR', 'CSR_COMPANY', 'PSU', 'NGO', 'TRUST'] } })
      .select('name logo website description annualCSRBudget');
    return sendSuccess(res, 200, 'CSR partners retrieved', partners);
  });
}

module.exports = new PublicPortalController();
