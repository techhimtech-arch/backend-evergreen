const expressAsyncHandler = require('express-async-handler');
const Group = require('../../models/Group');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

exports.createGroup = expressAsyncHandler(async (req, res) => {
  try {
    let groupData = { ...req.body };

    // Handling SUPER_ADMIN vs ORG_ADMIN logic
    if (req.user && req.user.userType !== 'SUPER_ADMIN') {
      // ORG admins can only create groups for their own organization
      groupData.organizationId = req.user.organizationId;
      groupData.isGlobal = false;
    } else {
      // SUPER_ADMIN
      if (groupData.isGlobal === true) {
        delete groupData.organizationId; // Global groups have no org
      } else if (!groupData.organizationId) {
        // If not global and no org specified, default to global
        groupData.isGlobal = true;
      }
    }

    const group = await Group.create(groupData);
    return sendSuccess(res, 201, 'Group created successfully', group);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

exports.getGroups = expressAsyncHandler(async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.userType !== 'SUPER_ADMIN') {
      query = {
        $or: [
          { organizationId: req.user.organizationId },
          { isGlobal: true }
        ]
      };
    }
    
    const groups = await Group.find(query).populate('organizationId', 'name');
    return sendSuccess(res, 200, 'Groups retrieved successfully', groups);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

exports.getGroup = expressAsyncHandler(async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('organizationId', 'name');
    if (!group) return sendNotFound(res, 'Group not found');

    if (req.user && req.user.userType !== 'SUPER_ADMIN') {
      // Allow if it's their own org OR if it's a global group
      const isOwnOrg = group.organizationId && group.organizationId._id.toString() === req.user.organizationId.toString();
      if (!isOwnOrg && !group.isGlobal) {
        return sendError(res, 403, 'Not authorized to access this group');
      }
    }

    return sendSuccess(res, 200, 'Group found', group);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

exports.updateGroup = expressAsyncHandler(async (req, res) => {
  try {
    let group = await Group.findById(req.params.id);
    if (!group) return sendNotFound(res, 'Group not found');

    if (req.user && req.user.userType !== 'SUPER_ADMIN') {
      // Cannot edit global groups unless super_admin
      if (group.isGlobal) {
        return sendError(res, 403, 'Cannot update global groups');
      }
      
      const isOwnOrg = group.organizationId && group.organizationId.toString() === req.user.organizationId.toString();
      if (!isOwnOrg) {
        return sendError(res, 403, 'Not authorized to update this group');
      }
      
      // Security: strip fields that shouldn't be altered by ORG_ADMIN
      delete req.body.organizationId;
      delete req.body.isGlobal;
    }

    group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('organizationId', 'name');
    return sendSuccess(res, 200, 'Group updated successfully', group);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

exports.deleteGroup = expressAsyncHandler(async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return sendNotFound(res, 'Group not found');

    if (req.user && req.user.userType !== 'SUPER_ADMIN') {
      if (group.isGlobal) {
        return sendError(res, 403, 'Cannot delete global groups');
      }
      
      const isOwnOrg = group.organizationId && group.organizationId.toString() === req.user.organizationId.toString();
      if (!isOwnOrg) {
        return sendError(res, 403, 'Not authorized to delete this group');
      }
    }

    await group.deleteOne();
    return sendSuccess(res, 200, 'Group deleted successfully', {});
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});