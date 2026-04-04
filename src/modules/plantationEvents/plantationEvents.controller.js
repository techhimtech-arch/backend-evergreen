const PlantationEvent = require('../../models/PlantationEvent');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

// @desc    Get all plantation events
// @route   GET /api/v1/events
// @access  Public/Private
exports.getEvents = async (req, res) => {
  try {
    const events = await PlantationEvent.find()
      .populate('organizationId', 'name')
      .populate('organizedBy', 'name email');
    return sendSuccess(res, 200, 'Events retrieved successfully', events);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Create a new plantation event
// @route   POST /api/v1/events
// @access  Private (Org Admin, Superadmin)
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizedBy: req.user.userId, // Logged in user
      organizationId: req.body.organizationId || req.user.organizationId
    };
    
    const event = await PlantationEvent.create(eventData);
    
    return sendSuccess(res, 201, 'Plantation event created successfully', event);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Get a single plantation event
// @route   GET /api/v1/events/:id
// @access  Public/Private
exports.getEventById = async (req, res) => {
  try {
    const event = await PlantationEvent.findById(req.params.id)
      .populate('organizationId', 'name')
      .populate('organizedBy', 'name email');
       
    if (!event) {
      return sendNotFound(res, 'Event not found');
    }
    return sendSuccess(res, 200, 'Event found', event);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update a plantation event
// @route   PUT /api/v1/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
  try {
    const event = await PlantationEvent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!event) {
      return sendNotFound(res, 'Event not found');
    }
    return sendSuccess(res, 200, 'Event updated successfully', event);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @desc    Delete a plantation event
// @route   DELETE /api/v1/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event = await PlantationEvent.findByIdAndDelete(req.params.id);
    if (!event) {
      return sendNotFound(res, 'Event not found');
    }
    return sendSuccess(res, 200, 'Event deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
