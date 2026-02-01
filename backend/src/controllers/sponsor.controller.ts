import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.model';

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

/**
 * Get sponsor profile
 * GET /api/sponsor/profile
 * Auth: Sponsor only
 */
export const getSponsorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!isValidObjectId(userId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
      return;
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Sponsor not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get sponsor profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile',
    });
  }
};

/**
 * Update sponsor profile
 * PUT /api/sponsor/profile
 * Auth: Sponsor only
 */
export const updateSponsorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { name, phone, organizationName, website, bio, logo } = req.body;

    if (!isValidObjectId(userId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
      return;
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (organizationName !== undefined) updates.organizationName = organizationName;
    if (website !== undefined) updates.website = website;
    if (bio !== undefined) updates.bio = bio;
    if (logo !== undefined) updates.logo = logo;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      select: '-password',
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Sponsor not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Update sponsor profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};
