const organizationsService = require('./organizations.service');
const { sendSuccess, sendError, sendNotFound, sendPaginatedResponse } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/error.middleware');

class OrganizationsController {
  createOrganization = asyncHandler(async (req, res) => {
    const result = await organizationsService.createOrganization(req.body);
    return sendSuccess(res, 201, 'Organization created successfully', result);
  });

  getOrganizations = asyncHandler(async (req, res) => {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      type: req.query.type,
      search: req.query.search
    };
    const result = await organizationsService.getOrganizations(filters);
    return sendPaginatedResponse(res, result.organizations, result.pagination, 'Organizations retrieved successfully');
  });

  getOrganizationById = asyncHandler(async (req, res) => {
    const org = await organizationsService.getOrganizationById(req.params.id);
    return sendSuccess(res, 200, 'Organization retrieved successfully', org);
  });

  updateOrganization = asyncHandler(async (req, res) => {
    const result = await organizationsService.updateOrganization(req.params.id, req.body);
    return sendSuccess(res, 200, 'Organization updated successfully', result);
  });

  toggleStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if(!['ACTIVE', 'SUSPENDED'].includes(status)) {
        return sendError(res, 400, 'Invalid status format');
    }
    const result = await organizationsService.updateOrganization(req.params.id, { status });
    return sendSuccess(res, 200, 'Organization status toggled successfully', result);
  });

  deleteOrganization = asyncHandler(async (req, res) => {
    const result = await organizationsService.deleteOrganization(req.params.id);
    return sendSuccess(res, 200, 'Organization suspended successfully', result);
  });
}

module.exports = new OrganizationsController();
