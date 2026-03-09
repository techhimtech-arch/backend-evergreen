const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  type: {
    type: String,
    enum: ['general', 'academic', 'sports', 'events', 'emergency', 'examination', 'holiday'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'expired'],
    default: 'draft'
  },
  targetAudience: {
    type: [{
      type: String,
      enum: ['all', 'students', 'teachers', 'parents', 'admin', 'specific_classes', 'specific_sections']
    }],
    required: true,
    default: ['all']
  },
  targetClasses: [{
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    className: String
  }],
  targetSections: [{
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    },
    sectionName: String
  }],
  targetUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userType: {
      type: String,
      enum: ['student', 'teacher', 'parent', 'admin']
    }
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  scheduledDate: {
    type: Date
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveryMethods: {
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    dashboard: {
      type: Boolean,
      default: true
    }
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  smsSent: {
    type: Boolean,
    default: false
  },
  pushSent: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: false
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
announcementSchema.index({ status: 1, publishDate: -1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ author: 1 });
announcementSchema.index({ expiryDate: 1 });
announcementSchema.index({ scheduledDate: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ type: 1 });

// Virtual for checking if announcement is expired
announcementSchema.virtual('isExpired').get(function() {
  return this.expiryDate && this.expiryDate < new Date();
});

// Virtual for checking if announcement is scheduled
announcementSchema.virtual('isScheduled').get(function() {
  return this.scheduledDate && this.scheduledDate > new Date();
});

// Virtual for checking if announcement is active
announcementSchema.virtual('isActive').get(function() {
  const now = new Date();
  const isExpired = this.expiryDate && this.expiryDate < now;
  const isScheduled = this.scheduledDate && this.scheduledDate > now;
  return this.status === 'published' && !isExpired && !isScheduled;
});

// Pre-save middleware to update status based on dates
announcementSchema.pre('save', function(next) {
  const now = new Date();
  
  // Auto expire announcements
  if (this.expiryDate && this.expiryDate < now && this.status === 'published') {
    this.status = 'expired';
  }
  
  // Auto publish scheduled announcements
  if (this.scheduledDate && this.scheduledDate <= now && this.status === 'scheduled') {
    this.status = 'published';
    this.publishDate = now;
  }
  
  next();
});

// Static method to find active announcements
announcementSchema.statics.findActive = function(filter = {}) {
  return this.find({
    ...filter,
    status: 'published',
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  }).sort({ isPinned: -1, priority: -1, publishDate: -1 });
};

// Static method to find announcements for user
announcementSchema.statics.findForUser = function(userId, userType, userClassId = null, userSectionId = null) {
  const query = {
    status: 'published',
    $or: [
      { targetAudience: 'all' },
      { targetAudience: userType },
      { targetUsers: { $elemMatch: { userId: userId } } }
    ]
  };
  
  // Add class-specific announcements if user has class info
  if (userClassId) {
    query.$or.push({
      targetAudience: 'specific_classes',
      'targetClasses.classId': userClassId
    });
  }
  
  // Add section-specific announcements if user has section info
  if (userSectionId) {
    query.$or.push({
      targetAudience: 'specific_sections',
      'targetSections.sectionId': userSectionId
    });
  }
  
  return this.find({
    ...query,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  }).sort({ isPinned: -1, priority: -1, publishDate: -1 });
};

// Instance method to mark as read
announcementSchema.methods.markAsRead = function(userId) {
  if (!this.readBy.some(read => read.userId.toString() === userId.toString())) {
    this.readBy.push({ userId });
    this.viewCount += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to add comment
announcementSchema.methods.addComment = function(userId, userName, comment) {
  if (this.allowComments) {
    this.comments.push({ userId, userName, comment });
    return this.save();
  }
  throw new Error('Comments are not allowed for this announcement');
};

module.exports = mongoose.model('Announcement', announcementSchema);
