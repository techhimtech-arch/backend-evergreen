const expressAsyncHandler = require('express-async-handler');
const Assignment = require('../../models/Assignment');
const User = require('../../models/User');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

exports.createAssignment = expressAsyncHandler(async (req, res) => {
  try {
    let assignmentData = { ...req.body };

    // Auto-add organizationId from authenticated user
    if (req.user.userType !== 'SUPER_ADMIN') {
      assignmentData.organizationId = req.user.organizationId;
    } else {
      // For SUPER_ADMIN, use provided organizationId or a default if available
      if (!assignmentData.organizationId && req.user.organizationId) {
        assignmentData.organizationId = req.user.organizationId;
      }
      // If SUPER_ADMIN doesn't have organizationId and doesn't provide one, 
      // we need to either require it or set a default organization
      if (!assignmentData.organizationId) {
        // Try to get first available organization or return error
        const Organization = require('../../models/Organization');
        const firstOrg = await Organization.findOne();
        if (firstOrg) {
          assignmentData.organizationId = firstOrg._id;
        } else {
          return sendError(res, 400, 'Organization ID is required for SUPER_ADMIN. Please provide organizationId or create an organization first.');
        }
      }
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

// Progress tracking methods
exports.updateProgress = expressAsyncHandler(async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return sendNotFound(res, 'Assignment not found');

    // Only assigned officer or admin can update progress
    if (req.user.userType !== 'SUPER_ADMIN' && 
        req.user.userType !== 'ORG_ADMIN' &&
        assignment.assignedOfficer.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to update progress');
    }

    const { plantsPlanted, notes, photos } = req.body;
    
    const progressUpdate = {
      date: new Date(),
      plantsPlanted: plantsPlanted || 0,
      notes: notes || '',
      photos: photos || [],
      addedBy: req.user._id
    };

    assignment.progressUpdates.push(progressUpdate);
    assignment.actualPlantsPlanted += plantsPlanted || 0;
    
    if (assignment.status === 'PENDING') {
      assignment.status = 'IN_PROGRESS';
    }
    
    if (assignment.actualPlantsPlanted >= assignment.targetPlants) {
      assignment.status = 'COMPLETED';
      assignment.completionDate = new Date();
    }

    await assignment.save();
    return sendSuccess(res, 200, 'Progress updated successfully', assignment);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

// Verification methods
exports.verifyAssignment = expressAsyncHandler(async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return sendNotFound(res, 'Assignment not found');

    // Only admin can verify
    if (req.user.userType !== 'SUPER_ADMIN' && req.user.userType !== 'ORG_ADMIN') {
      return sendError(res, 403, 'Not authorized to verify assignments');
    }

    if (assignment.status !== 'COMPLETED') {
      return sendError(res, 400, 'Only completed assignments can be verified');
    }

    const { verificationNotes, approved } = req.body;
    
    assignment.verifiedBy = req.user._id;
    assignment.verificationDate = new Date();
    assignment.verificationNotes = verificationNotes || '';
    
    if (approved) {
      assignment.status = 'VERIFIED';
    } else {
      assignment.status = 'REJECTED';
      assignment.rejectionReason = verificationNotes || 'Verification failed';
    }

    await assignment.save();
    return sendSuccess(res, 200, `Assignment ${approved ? 'verified' : 'rejected'} successfully`, assignment);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

// Get assignments by officer
exports.getOfficerAssignments = expressAsyncHandler(async (req, res) => {
  try {
    const officerId = req.params.officerId || req.user._id;
    
    // Security check - only get own assignments unless admin
    if (req.user.userType !== 'SUPER_ADMIN' && 
        req.user.userType !== 'ORG_ADMIN' && 
        officerId !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to view these assignments');
    }

    const assignments = await Assignment.find({ assignedOfficer: officerId })
      .populate('groupId', 'groupName village')
      .populate('assignedOfficer', 'firstName lastName')
      .populate('organizationId', 'name');
    
    return sendSuccess(res, 200, 'Officer assignments retrieved successfully', assignments);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});