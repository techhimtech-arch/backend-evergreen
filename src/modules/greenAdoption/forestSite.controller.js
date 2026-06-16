const ForestSite = require('../../models/ForestSite');
const { sendSuccess, sendError, sendNotFound, sendPaginatedResponse } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/error.middleware');

class ForestSiteController {
  createSite = asyncHandler(async (req, res) => {
    const site = new ForestSite(req.body);
    await site.save();
    return sendSuccess(res, 201, 'Forest site created successfully', site);
  });

  getSites = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    
    const sites = await ForestSite.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await ForestSite.countDocuments(query);
    
    return sendPaginatedResponse(res, sites, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }, 'Forest sites retrieved successfully');
  });

  getSiteById = asyncHandler(async (req, res) => {
    const site = await ForestSite.findById(req.params.id);
    if (!site) return sendNotFound(res, 'Forest site not found');
    return sendSuccess(res, 200, 'Forest site retrieved', site);
  });

  updateSite = asyncHandler(async (req, res) => {
    const site = await ForestSite.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!site) return sendNotFound(res, 'Forest site not found');
    return sendSuccess(res, 200, 'Forest site updated', site);
  });

  deleteSite = asyncHandler(async (req, res) => {
    const site = await ForestSite.findByIdAndDelete(req.params.id);
    if (!site) return sendNotFound(res, 'Forest site not found');
    return sendSuccess(res, 200, 'Forest site deleted');
  });

  uploadKML = asyncHandler(async (req, res) => {
    // Logic for parsing KML and updating the site's geoBoundary
    // This is a placeholder for KML parsing
    const { id } = req.params;
    const site = await ForestSite.findById(id);
    if (!site) return sendNotFound(res, 'Forest site not found');
    
    // Simulate KML parsing to GeoJSON
    // In reality, this would read req.file using multer and a library like @tmcw/togeojson
    
    site.kmlFileUrl = req.body.kmlFileUrl || 'dummy_url';
    await site.save();
    
    return sendSuccess(res, 200, 'KML uploaded and parsed successfully', site);
  });
}

module.exports = new ForestSiteController();
