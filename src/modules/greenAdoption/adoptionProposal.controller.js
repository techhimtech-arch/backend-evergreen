const AdoptionProposal = require('../../models/AdoptionProposal');
const { sendSuccess, sendError, sendNotFound, sendPaginatedResponse } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/error.middleware');

class AdoptionProposalController {
  createProposal = asyncHandler(async (req, res) => {
    const proposalData = {
      ...req.body,
      organizationId: req.user.organizationId || req.body.organizationId,
      status: 'SUBMITTED'
    };
    const proposal = new AdoptionProposal(proposalData);
    await proposal.save();
    return sendSuccess(res, 201, 'Adoption proposal submitted successfully', proposal);
  });

  getProposals = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    let query = {};
    
    // If not super admin, restrict to their organization
    if (req.user.role === 'CSR') {
      query.organizationId = req.user.organizationId;
    }
    
    if (status) query.status = status;
    
    const proposals = await AdoptionProposal.find(query)
      .populate('siteId', 'siteName siteCode')
      .populate('organizationId', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await AdoptionProposal.countDocuments(query);
    
    return sendPaginatedResponse(res, proposals, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }, 'Proposals retrieved successfully');
  });

  getProposalById = asyncHandler(async (req, res) => {
    const proposal = await AdoptionProposal.findById(req.params.id)
      .populate('siteId')
      .populate('organizationId');
    if (!proposal) return sendNotFound(res, 'Proposal not found');
    return sendSuccess(res, 200, 'Proposal retrieved', proposal);
  });

  reviewProposal = asyncHandler(async (req, res) => {
    const { status, remarks } = req.body;
    
    if (!['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) {
      return sendError(res, 400, 'Invalid status update');
    }

    const proposal = await AdoptionProposal.findByIdAndUpdate(
      req.params.id, 
      { 
        status, 
        remarks, 
        reviewedBy: req.user.userId, 
        reviewedAt: Date.now() 
      }, 
      { new: true }
    );
    
    if (!proposal) return sendNotFound(res, 'Proposal not found');
    return sendSuccess(res, 200, 'Proposal reviewed successfully', proposal);
  });
}

module.exports = new AdoptionProposalController();
