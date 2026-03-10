const User = require('../../models/User');
const { hashPassword } = require('../../utils/password');
const logger = require('../../config/logger');

class UsersService {
  /**
   * Create a new user
   */
  async createUser(userData, creatorId = null) {
    const { name, email, password, role, schoolId, isActive = true } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      schoolId,
      isActive,
    });

    await user.save();

    logger.info('User created successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
      creatorId,
    });

    return this.formatUserResponse(user);
  }

  /**
   * Get users with pagination and filtering
   */
  async getUsers(filters = {}) {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      schoolId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build query
    const query = {};

    if (role) {
      query.role = role;
    }

    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    if (schoolId) {
      query.schoolId = schoolId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('schoolId', 'name');

    const total = await User.countDocuments(query);

    return {
      users: users.map(user => this.formatUserResponse(user)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password').populate('schoolId', 'name');

    if (!user) {
      throw new Error('User not found');
    }

    return this.formatUserResponse(user);
  }

  /**
   * Update user
   */
  async updateUser(userId, updateData, updaterId = null) {
    const { name, email, role, schoolId, isActive } = updateData;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw new Error('Email already exists');
      }
      user.email = email;
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (schoolId !== undefined) user.schoolId = schoolId;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    logger.info('User updated successfully', {
      userId: user._id,
      email: user.email,
      updaterId,
    });

    return this.formatUserResponse(user);
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async deleteUser(userId, deleterId = null) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    logger.info('User deleted successfully', {
      userId: user._id,
      email: user.email,
      deleterId,
    });

    return this.formatUserResponse(user);
  }

  /**
   * Hard delete user (permanent deletion)
   */
  async hardDeleteUser(userId, deleterId = null) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await User.findByIdAndDelete(userId);

    logger.warn('User permanently deleted', {
      userId: user._id,
      email: user.email,
      deleterId,
    });

    return { message: 'User permanently deleted' };
  }

  /**
   * Get user statistics
   */
  async getUserStats(schoolId = null) {
    const matchStage = {};
    if (schoolId) {
      matchStage.schoolId = schoolId;
    }

    const stats = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
        }
      },
      {
        $project: {
          _id: 0,
          totalUsers: 1,
          activeUsers: 1,
          inactiveUsers: 1,
        }
      }
    ]);

    const roleStats = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      summary: stats[0] || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 },
      byRole: roleStats,
    };
  }

  /**
   * Search users
   */
  async searchUsers(query, options = {}) {
    const { limit = 20, schoolId, role } = options;

    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    };

    if (schoolId) {
      searchQuery.schoolId = schoolId;
    }

    if (role) {
      searchQuery.role = role;
    }

    const users = await User.find(searchQuery)
      .select('-password')
      .limit(limit)
      .populate('schoolId', 'name');

    return users.map(user => this.formatUserResponse(user));
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(userIds, updateData, updaterId = null) {
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    logger.info('Users bulk updated', {
      userIds,
      updateData,
      updaterId,
      modifiedCount: result.modifiedCount,
    });

    return {
      message: 'Users updated successfully',
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Format user response object
   */
  formatUserResponse(user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      school: user.schoolId || null,
    };
  }
}

module.exports = new UsersService();
