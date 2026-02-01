import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import User from '../models/User.model';

/**
 * GET /api/admin/users
 * Get all users with filters and pagination
 * Auth: Admin only
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      role,
      isActive,
      isVerified,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (role && typeof role === 'string') {
      if (!['organizer', 'sponsor', 'admin'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role. Must be: organizer, sponsor, or admin',
        });
        return;
      }
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified === 'true';
    }

    // Search by name or email
    if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users',
    });
  }
};

/**
 * GET /api/admin/users/:id
 * Get single user by ID
 * Auth: Admin only
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
      return;
    }

    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user',
    });
  }
};

/**
 * PATCH /api/admin/users/:id/status
 * Activate or deactivate a user
 * Body: { isActive: boolean }
 * Auth: Admin only
 */
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const adminId = (req as any).userId;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
      return;
    }

    if (typeof isActive !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value',
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === adminId) {
      res.status(403).json({
        success: false,
        message: 'You cannot modify your own status',
      });
      return;
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user status',
    });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Soft delete a user (set isActive = false)
 * Auth: Admin only
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).userId;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Prevent deleting self
    if (user._id.toString() === adminId) {
      res.status(403).json({
        success: false,
        message: 'You cannot delete your own account',
      });
      return;
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
      res.status(403).json({
        success: false,
        message: 'You cannot delete another admin account',
      });
      return;
    }

    // Soft delete: set isActive to false
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user',
    });
  }
};
