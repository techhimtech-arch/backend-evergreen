const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['superadmin', 'school_admin', 'teacher', 'accountant', 'parent', 'student'],
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  permissions: [{
    type: String,
    enum: [
      // User management
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      
      // Role management
      'roles:create',
      'roles:read',
      'roles:update',
      'roles:delete',
      
      // School management
      'school:create',
      'school:read',
      'school:update',
      'school:delete',
      
      // Class management
      'classes:create',
      'classes:read',
      'classes:update',
      'classes:delete',
      
      // Student management
      'students:create',
      'students:read',
      'students:update',
      'students:delete',
      
      // Teacher management
      'teachers:create',
      'teachers:read',
      'teachers:update',
      'teachers:delete',
      
      // Attendance management
      'attendance:create',
      'attendance:read',
      'attendance:update',
      'attendance:delete',
      
      // Fee management
      'fees:create',
      'fees:read',
      'fees:update',
      'fees:delete',
      
      // Exam management
      'exams:create',
      'exams:read',
      'exams:update',
      'exams:delete',
      
      // Reports
      'reports:read',
      'reports:generate',
      
      // System admin
      'system:admin',
      'system:audit',
    ],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
roleSchema.index({ name: 1 });
roleSchema.index({ schoolId: 1 });

// Pre-save middleware
roleSchema.pre('save', function(next) {
  if (this.name === 'superadmin') {
    // Superadmin has all permissions
    this.permissions = [
      'users:create', 'users:read', 'users:update', 'users:delete',
      'roles:create', 'roles:read', 'roles:update', 'roles:delete',
      'school:create', 'school:read', 'school:update', 'school:delete',
      'classes:create', 'classes:read', 'classes:update', 'classes:delete',
      'students:create', 'students:read', 'students:update', 'students:delete',
      'teachers:create', 'teachers:read', 'teachers:update', 'teachers:delete',
      'attendance:create', 'attendance:read', 'attendance:update', 'attendance:delete',
      'fees:create', 'fees:read', 'fees:update', 'fees:delete',
      'exams:create', 'exams:read', 'exams:update', 'exams:delete',
      'reports:read', 'reports:generate',
      'system:admin', 'system:audit',
    ];
  }
  next();
});

// Static method to find role by name
roleSchema.statics.findByName = function(name) {
  return this.findOne({ name, isActive: true });
};

// Static method to get role permissions
roleSchema.statics.getRolePermissions = async function(roleName) {
  const role = await this.findOne({ name: roleName, isActive: true });
  return role ? role.permissions : [];
};

// Instance method to check permission
roleSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('Role', roleSchema);
