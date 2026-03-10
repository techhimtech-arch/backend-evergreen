const mongoose = require('mongoose');

// Ensure related models are registered
require('./Permission');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    enum: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EDITOR', 'USER']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
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
roleSchema.index({ isActive: 1 });

// Virtual for permissions
roleSchema.virtual('permissions', {
  ref: 'RolePermission',
  localField: '_id',
  foreignField: 'roleId'
});

// Static method to find role by name
roleSchema.statics.findByName = function(name) {
  return this.findOne({ name: name.toUpperCase(), isActive: true });
};

// Static method to get role permissions
roleSchema.statics.getRolePermissions = async function(roleName) {
  const role = await this.findOne({ name: name.toUpperCase(), isActive: true });
  if (!role) return [];
  
  const RolePermission = mongoose.model('RolePermission');
  const rolePermissions = await RolePermission.findActivePermissionsForRole(role._id);
  return rolePermissions.map(rp => rp.permissionId);
};

// Instance method to check permission
roleSchema.methods.hasPermission = async function(permissionName) {
  const RolePermission = mongoose.model('RolePermission');
  const Permission = mongoose.model('Permission');
  
  const permission = await Permission.findByName(permissionName);
  if (!permission) return false;
  
  const rolePermission = await RolePermission.findOne({
    roleId: this._id,
    permissionId: permission._id,
    isActive: true
  });
  
  return !!rolePermission;
};

// Instance method to get all permissions
roleSchema.methods.getAllPermissions = async function() {
  const RolePermission = mongoose.model('RolePermission');
  const rolePermissions = await RolePermission.findActivePermissionsForRole(this._id);
  return rolePermissions.map(rp => rp.permissionId);
};

module.exports = mongoose.model('Role', roleSchema);
