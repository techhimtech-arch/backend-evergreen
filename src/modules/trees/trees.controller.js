const Tree = require('../../models/Tree');
const Assignment = require('../../models/Assignment');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

// Helper function to generate human-readable tree ID
const generateTreeId = async (assignmentId) => {
  try {
    const assignment = await Assignment.findById(assignmentId).populate('groupId');
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const group = assignment.groupId;
    const district = group.district ? group.district.substring(0, 3).toUpperCase() : 'HP';
    const year = new Date().getFullYear();
    
    // Count existing trees for this assignment
    const treeCount = await Tree.countDocuments({ assignmentId });
    const sequence = String(treeCount + 1).padStart(4, '0');
    
    return `${district}-${year}-${sequence}`;
  } catch (error) {
    // Fallback to simpler format
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `HP-${year}-${random}`;
  }
};

// @desc    Get all trees (with pagination/filters)
// @route   GET /api/v1/trees
// @access  Public/Private
exports.getTrees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      assignmentId,
      groupId,
      speciesId,
      plantedBy
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (assignmentId) filter.assignmentId = assignmentId;
    if (groupId) filter.groupId = groupId;
    if (speciesId) filter.speciesId = speciesId;
    if (plantedBy) filter.plantedBy = plantedBy;

    const trees = await Tree.find(filter)
      .populate('assignmentId', 'targetPlants landArea')
      .populate('eventId', 'eventName eventDate location')
      .populate('speciesId', 'name scientificName category')
      .populate('groupId', 'groupName village district')
      .populate('plantedBy', 'firstName lastName email')
      .sort({ plantedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tree.countDocuments(filter);

    return sendSuccess(res, 200, 'Trees retrieved', {
      trees,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get dashboard-level tree statistics
// @route   GET /api/v1/trees/statistics
// @access  Public/Private
exports.getTreeStatistics = async (req, res) => {
  try {
    const totalTrees = await Tree.countDocuments();
    const statusCounts = await Tree.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const districtCounts = await Tree.aggregate([
      {
        $lookup: {
          from: 'groups',
          localField: 'groupId',
          foreignField: '_id',
          as: 'group'
        }
      },
      { $unwind: { path: '$group', preserveNullAndEmpty: true } },
      {
        $group: {
          _id: { $ifNull: ['$group.district', 'Unassigned'] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const treesByStatus = statusCounts.reduce((acc, item) => {
      acc[item._id || 'UNKNOWN'] = item.count;
      return acc;
    }, {});
    const deadTrees = treesByStatus.DEAD || 0;
    const survivalRate = totalTrees > 0 ? Number((((totalTrees - deadTrees) / totalTrees) * 100).toFixed(1)) : 0;

    return sendSuccess(res, 200, 'Tree statistics retrieved', {
      totalTrees,
      survivalRate,
      treesByStatus,
      districtCounts
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get tree map markers
// @route   GET /api/v1/trees/map-data
// @access  Public/Private
exports.getTreeMapData = async (req, res) => {
  try {
    const trees = await Tree.find({
      latitude: { $exists: true },
      longitude: { $exists: true }
    })
      .populate('speciesId', 'name scientificName category')
      .populate('groupId', 'groupName village district')
      .select('treeId latitude longitude location status plantedDate speciesId groupId verificationStatus')
      .limit(5000);

    const markers = trees.map(tree => ({
      id: tree._id,
      treeId: tree.treeId,
      latitude: tree.latitude,
      longitude: tree.longitude,
      location: tree.location,
      status: tree.status,
      plantedDate: tree.plantedDate,
      species: tree.speciesId,
      group: tree.groupId,
      verificationStatus: tree.verificationStatus
    }));

    return sendSuccess(res, 200, 'Tree map data retrieved', markers);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get tree timeline combining planting and photo events
// @route   GET /api/v1/trees/:id/timeline
// @access  Public/Private
exports.getTreeTimeline = async (req, res) => {
  try {
    const tree = await Tree.findById(req.params.id)
      .populate('speciesId', 'name scientificName category')
      .populate('plantedBy', 'firstName lastName email');

    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    const timeline = [
      {
        type: 'PLANTED',
        date: tree.plantedDate,
        title: 'Tree planted',
        status: tree.status,
        remarks: tree.remarks
      },
      ...tree.photos.map(photo => ({
        type: 'PHOTO',
        date: photo.uploadedAt,
        title: photo.caption || 'Photo uploaded',
        url: photo.url
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return sendSuccess(res, 200, 'Tree timeline retrieved', { tree, timeline });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get tree photos
// @route   GET /api/v1/trees/:id/photos
// @access  Public/Private
exports.getTreePhotos = async (req, res) => {
  try {
    const tree = await Tree.findById(req.params.id).select('treeId photos');
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    return sendSuccess(res, 200, 'Tree photos retrieved', {
      treeId: tree.treeId,
      photos: tree.photos
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Register a new tree
// @route   POST /api/v1/trees
// @access  Private (authenticated user)
exports.registerTree = async (req, res) => {
  try {
    const { assignmentId, eventId, speciesId, groupId, ...otherData } = req.body;

    // Validate required fields (eventId is optional for field workers)
    if (!assignmentId || !speciesId || !groupId) {
      return sendError(res, 400, 'Missing required fields: assignmentId, speciesId, groupId');
    }

    // Generate human-readable tree ID
    const treeId = await generateTreeId(assignmentId);

    // Inject the logged-in user automatically as the planter
    const treeData = {
      treeId,
      assignmentId,
      speciesId,
      groupId,
      plantedBy: req.user.userId,  // auth middleware sets userId not _id
      plantedDate: new Date(),
      ...otherData
    };
    // Only add eventId if provided
    if (eventId) treeData.eventId = eventId;
    
    const tree = await Tree.create(treeData);
    
    // Populate relations for response
    await tree.populate([
      { path: 'assignmentId', select: 'targetPlants landArea' },
      { path: 'eventId', select: 'eventName eventDate location' },
      { path: 'speciesId', select: 'name scientificName category' },
      { path: 'groupId', select: 'groupName village district' },
      { path: 'plantedBy', select: 'firstName lastName email' }
    ]);
    
    return sendSuccess(res, 201, 'Tree registered successfully', tree);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Get a single tree details
// @route   GET /api/v1/trees/:id
// @access  Public/Private
exports.getTree = async (req, res) => {
  try {
    const tree = await Tree.findById(req.params.id)
       .populate('assignmentId', 'targetPlants landArea')
       .populate('eventId', 'eventName eventDate location')
       .populate('speciesId', 'name scientificName category')
       .populate('groupId', 'groupName village district')
       .populate('plantedBy', 'firstName lastName email')
       .populate('verifiedBy', 'firstName lastName');
       
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }
    return sendSuccess(res, 200, 'Tree found', tree);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update tree details (health/status etc)
// @route   PUT /api/v1/trees/:id
// @access  Private
exports.updateTree = async (req, res) => {
  try {
    const allowedFields = [
      'status', 'growthStage', 'healthRemarks', 'latitude', 'longitude',
      'location', 'lastInspectionDate', 'nextInspectionDate'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const tree = await Tree.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('speciesId', 'name scientificName category')
      .populate('plantedBy', 'firstName lastName email');

    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }
    return sendSuccess(res, 200, 'Tree updated successfully', tree);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Delete tree record (Admin typically)
// @route   DELETE /api/v1/trees/:id
// @access  Private/Admin
exports.deleteTree = async (req, res) => {
  try {
    const tree = await Tree.findByIdAndDelete(req.params.id);
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }
    return sendSuccess(res, 200, 'Tree deleted');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Add photo to tree
// @route   POST /api/v1/trees/:id/photos
// @access  Private
exports.addTreePhoto = async (req, res) => {
  try {
    const { url, caption } = req.body;

    if (!url) {
      return sendError(res, 400, 'Photo URL is required');
    }

    const tree = await Tree.findById(req.params.id);
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    const newPhoto = {
      url,
      caption: caption || '',
      uploadedBy: req.user.userId,
      uploadedAt: new Date()
    };

    tree.photos.push(newPhoto);
    await tree.save();

    return sendSuccess(res, 200, 'Photo added successfully', tree);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Update tree health status
// @route   PATCH /api/v1/trees/:id/health
// @access  Private
exports.updateTreeHealth = async (req, res) => {
  try {
    const { status, growthStage, healthRemarks } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (growthStage) updateData.growthStage = growthStage;
    if (healthRemarks !== undefined) updateData.healthRemarks = healthRemarks;

    updateData.lastInspectionDate = new Date();

    const tree = await Tree.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('speciesId', 'name scientificName category')
      .populate('plantedBy', 'firstName lastName email');

    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    return sendSuccess(res, 200, 'Tree health updated successfully', tree);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Get trees by health status
// @route   GET /api/v1/trees/health/:status
// @access  Private
exports.getTreesByHealthStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['PLANTED', 'GROWING', 'HEALTHY', 'WEAK', 'DEAD'];

    if (!validStatuses.includes(status.toUpperCase())) {
      return sendError(res, 400, 'Invalid health status');
    }

    const trees = await Tree.find({ status: status.toUpperCase() })
      .populate('speciesId', 'name scientificName category')
      .populate('plantedBy', 'firstName lastName email')
      .sort({ plantedAt: -1 });

    return sendSuccess(res, 200, `Trees with ${status} status retrieved`, trees);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get trees needing inspection
// @route   GET /api/v1/trees/needing-inspection
// @access  Private
exports.getTreesNeedingInspection = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trees = await Tree.find({
      $or: [
        { lastInspectionDate: { $lt: thirtyDaysAgo } },
        { lastInspectionDate: { $exists: false } }
      ],
      status: { $ne: 'DEAD' }
    })
      .populate('speciesId', 'name scientificName category')
      .populate('plantedBy', 'firstName lastName email')
      .sort({ plantedAt: -1 });

    return sendSuccess(res, 200, 'Trees needing inspection retrieved', trees);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
