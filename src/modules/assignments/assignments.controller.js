const expressAsyncHandler = require('express-async-handler');
const Assignment = require('../../models/Assignment');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

exports.createAssignment = expressAsyncHandler(async (req, res) => {
  try {
    let assignmentData = { ...req.body };

    // SUPER_ADMIN can assign to any org, ORG_ADMIN only to their own
    if (req.user.userType !== 'SUPER_ADMIN') {
      assignmentData.organizationId = req.user.organizationId;
    }

    const assignment = await Assignment.create(assignmentData);
    return sendSuccess(res, 201, 'Assignment created successfully', assignment);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

exports.getAssignments = expressAsyncHandler(async (req, res) => {
  try {
    let query = {};
    if (req.user.userType !== 'SUPER_ADMIN') {
      query.organizationId = req.user.organizationId;
    }

    const assignments = await Assignment.find(query)
      .populate('groupId', 'groupName village')
      .populate('assignedOfficer', 'firstName lastName')
      .populate('organizationId', 'name');
    return sendSuccess(res, 200, 'Assignments retrieved successfully', assignments);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

exports.getAssignment = expressAsyncHandler(async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('groupId', 'groupName village')
      .populate('assignedOfficer', 'firstName lastName')
      .populate('organizationId', 'name');

    if (!assignment) {
      return sendNotFound(res, 'Assignment not found');
    }

    // Security check
    if (req.user.userType !== 'SUPER_ADMIN' && 
        assignment.organizationId.toString() !== req.user.organizationId.toString()) {
      return sendError(res, 403, 'Not authorized to access this assignment');
    }

    return sendSuccess(res, 200, 'Assignment found', assignment);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

exports.updateAssignment = expressAsyncHandler(async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id);
    if (!assignment) return sendNotFound(res, 'Assignment not found');

    if (req.user.userType !== 'SUPER_ADMIN' && 
        assignment.organizationId.toString() !== req.user.organizationId.toString()) {
      return sendError(res, 403, 'Not authorized to update this assignment');
    }

    assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    })
      .populate('groupId', 'groupName village')
      .populate('assignedOfficer', 'firstName lastName')
      .populate('organizationId', 'name');

    return sendSuccess(res, 200, 'Assignment updated successfully', assignment);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

exports.deleteAssignment = expressAsyncHandler(async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return sendNotFound(res, 'Assignment not found');

    if (req.user.userType !== 'SUPER_ADMIN' && 
        assignment.organizationId.toString() !== req.user.organizationId.toString()) {
      return sendError(res, 403, 'Not authorized to delete this assignment');
    }

    await assignment.deleteOne();
    return sendSuccess(res, 200, 'Assignment deleted successfully', {});
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});