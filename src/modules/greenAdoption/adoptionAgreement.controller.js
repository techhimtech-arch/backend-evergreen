const AdoptionAgreement = require('../../models/AdoptionAgreement');
const { sendSuccess, sendError, sendNotFound, sendPaginatedResponse } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/error.middleware');

class AdoptionAgreementController {
  createAgreement = asyncHandler(async (req, res) => {
    const agreement = new AdoptionAgreement(req.body);
    await agreement.save();
    return sendSuccess(res, 201, 'Adoption agreement created successfully', agreement);
  });

  getAgreements = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    let query = {};
    
    // If not super admin, restrict to their organization
    if (req.user.role === 'CSR') {
      query.organizationId = req.user.organizationId;
    }
    
    if (status) query.status = status;
    
    const agreements = await AdoptionAgreement.find(query)
      .populate('siteId', 'siteName siteCode')
      .populate('organizationId', 'name')
      .populate('proposalId', 'proposalNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await AdoptionAgreement.countDocuments(query);
    
    return sendPaginatedResponse(res, agreements, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }, 'Agreements retrieved successfully');
  });

  getAgreementById = asyncHandler(async (req, res) => {
    const agreement = await AdoptionAgreement.findById(req.params.id)
      .populate('siteId')
      .populate('organizationId')
      .populate('proposalId');
    if (!agreement) return sendNotFound(res, 'Agreement not found');
    return sendSuccess(res, 200, 'Agreement retrieved', agreement);
  });

  updateAgreement = asyncHandler(async (req, res) => {
    const agreement = await AdoptionAgreement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!agreement) return sendNotFound(res, 'Agreement not found');
    return sendSuccess(res, 200, 'Agreement updated', agreement);
  });
}

module.exports = new AdoptionAgreementController();
