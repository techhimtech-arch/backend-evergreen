const PlantationEvent = require('../../models/PlantationEvent');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

// @desc    Get all plantation events
// @route   GET /api/v1/events
// @access  Public/Private
exports.getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      assignmentId,
      organizedBy
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (assignmentId) filter.assignmentId = assignmentId;
    if (organizedBy) filter.organizedBy = organizedBy;

    const events = await PlantationEvent.find(filter)
      .populate('assignmentId', 'targetPlants landArea')
      .populate('organizedBy', 'firstName lastName email')
      .sort({ eventDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PlantationEvent.countDocuments(filter);

    return sendSuccess(res, 200, 'Events retrieved successfully', {
      events,
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

// @desc    Create a new plantation event
// @route   POST /api/v1/events
// @access  Private (Org Admin, Superadmin)
exports.createEvent = async (req, res) => {
  try {
    const { assignmentId, ...eventData } = req.body;

    // Validate required fields
    if (!assignmentId) {
      return sendError(res, 400, 'Assignment ID is required');
    }

    const newEventData = {
      assignmentId,
      organizedBy: req.user._id, // Logged in user
      ...eventData
    };
    
    const event = await PlantationEvent.create(newEventData);
    
    // Populate for response
    await event.populate([
      { path: 'assignmentId', select: 'targetPlants landArea' },
      { path: 'organizedBy', select: 'firstName lastName email' }
    ]);
    
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
      .populate('assignmentId', 'targetPlants landArea')
      .populate('organizedBy', 'firstName lastName email');
       
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
