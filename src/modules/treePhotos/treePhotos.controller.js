const TreePhoto = require('../../models/TreePhoto');
const Tree = require('../../models/Tree');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

// @desc    Upload photo for a tree
// @route   POST /api/v1/trees/:treeId/photos
// @access  Private
exports.uploadTreePhoto = async (req, res) => {
  try {
    const { treeId } = req.params;
    const { photoUrl, type, caption, remarks } = req.body;

    // Validate tree exists
    const tree = await Tree.findById(treeId);
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    // Validate required fields
    if (!photoUrl) {
      return sendError(res, 400, 'Photo URL is required');
    }

    const validTypes = ['PLANTATION', 'INSPECTION', 'FOLLOWUP', 'MONITORING', 'OTHER'];
    if (type && !validTypes.includes(type)) {
      return sendError(res, 400, 'Invalid photo type');
    }

    // Create photo record
    const photo = await TreePhoto.create({
      treeId,
      photoUrl,
      type: type || 'OTHER',
      caption: caption || '',
      remarks: remarks || '',
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    });

    // Populate for response
    await photo.populate([
      { path: 'treeId', select: 'treeId' },
      { path: 'uploadedBy', select: 'firstName lastName email' }
    ]);

    return sendSuccess(res, 201, 'Photo uploaded successfully', photo);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Get photos for a specific tree
// @route   GET /api/v1/trees/:treeId/photos
// @access  Private
exports.getTreePhotos = async (req, res) => {
  try {
    const { treeId } = req.params;
    const { type, page = 1, limit = 20 } = req.query;

    // Validate tree exists
    const tree = await Tree.findById(treeId);
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    const filter = { treeId, status: 'ACTIVE' };
    if (type) filter.type = type;

    const photos = await TreePhoto.find(filter)
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ uploadedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TreePhoto.countDocuments(filter);

    return sendSuccess(res, 200, 'Tree photos retrieved', {
      photos,
      tree: {
        treeId: tree.treeId,
        status: tree.status,
        growthStage: tree.growthStage
      },
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

// @desc    Get a specific photo
// @route   GET /api/v1/tree-photos/:id
// @access  Private
exports.getTreePhoto = async (req, res) => {
  try {
    const photo = await TreePhoto.findById(req.params.id)
      .populate('treeId', 'treeId status growthStage')
      .populate('uploadedBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email');

    if (!photo) {
      return sendNotFound(res, 'Photo not found');
    }

    return sendSuccess(res, 200, 'Photo found', photo);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update photo details
// @route   PATCH /api/v1/tree-photos/:id
// @access  Private
exports.updateTreePhoto = async (req, res) => {
  try {
    const { caption, remarks, tags } = req.body;
    
    const updateData = {};
    if (caption !== undefined) updateData.caption = caption;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (tags) updateData.tags = tags;

    const photo = await TreePhoto.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('treeId', 'treeId')
      .populate('uploadedBy', 'firstName lastName email');

    if (!photo) {
      return sendNotFound(res, 'Photo not found');
    }

    return sendSuccess(res, 200, 'Photo updated successfully', photo);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Verify a photo
// @route   PATCH /api/v1/tree-photos/:id/verify
// @access  Private/Admin
exports.verifyTreePhoto = async (req, res) => {
  try {
    const { verified, quality } = req.body;

    const updateData = {
      verified: verified !== undefined ? verified : true,
      verifiedBy: req.user._id,
      verifiedAt: new Date()
    };

    if (quality) updateData.quality = quality;

    const photo = await TreePhoto.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('treeId', 'treeId')
      .populate('uploadedBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email');

    if (!photo) {
      return sendNotFound(res, 'Photo not found');
    }

    return sendSuccess(res, 200, 'Photo verification updated successfully', photo);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Delete/hide a photo
// @route   DELETE /api/v1/tree-photos/:id
// @access  Private
exports.deleteTreePhoto = async (req, res) => {
  try {
    const photo = await TreePhoto.findByIdAndUpdate(
      req.params.id,
      { status: 'DELETED' },
      { new: true }
    );

    if (!photo) {
      return sendNotFound(res, 'Photo not found');
    }

    return sendSuccess(res, 200, 'Photo deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get photos by type
// @route   GET /api/v1/tree-photos/type/:type
// @access  Private
exports.getPhotosByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const validTypes = ['PLANTATION', 'INSPECTION', 'FOLLOWUP', 'MONITORING', 'OTHER'];
    if (!validTypes.includes(type)) {
      return sendError(res, 400, 'Invalid photo type');
    }

    const photos = await TreePhoto.find({ 
      type, 
      status: 'ACTIVE' 
    })
      .populate('treeId', 'treeId status')
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ uploadedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TreePhoto.countDocuments({ type, status: 'ACTIVE' });

    return sendSuccess(res, 200, `Photos of type ${type} retrieved`, {
      photos,
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

// @desc    Get unverified photos
// @route   GET /api/v1/tree-photos/unverified
// @access  Private/Admin
exports.getUnverifiedPhotos = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const photos = await TreePhoto.find({ 
      verified: false, 
      status: 'ACTIVE' 
    })
      .populate('treeId', 'treeId status')
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ uploadedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TreePhoto.countDocuments({ 
      verified: false, 
      status: 'ACTIVE' 
    });

    return sendSuccess(res, 200, 'Unverified photos retrieved', {
      photos,
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

// @desc    Get photo timeline for a tree
// @route   GET /api/v1/trees/:treeId/photo-timeline
// @access  Private
exports.getTreePhotoTimeline = async (req, res) => {
  try {
    const { treeId } = req.params;

    // Validate tree exists
    const tree = await Tree.findById(treeId);
    if (!tree) {
      return sendNotFound(res, 'Tree not found');
    }

    const photos = await TreePhoto.find({ 
      treeId, 
      status: 'ACTIVE' 
    })
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ uploadedAt: 1 }); // Chronological order

    // Group photos by type for timeline
    const timeline = photos.map(photo => ({
      _id: photo._id,
      date: photo.uploadedAt,
      type: photo.type,
      photoUrl: photo.photoUrl,
      caption: photo.caption,
      uploadedBy: photo.uploadedBy,
      remarks: photo.remarks
    }));

    return sendSuccess(res, 200, 'Tree photo timeline retrieved', {
      tree: {
        treeId: tree.treeId,
        plantedDate: tree.plantedDate
      },
      timeline
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
