import { Request, Response } from 'express';
import Collaboration from '../models/Collaboration.model';

/**
 * Get collaborations (user's or all for admin)
 * GET /api/collaborations
 * Auth: Authenticated (organizer/sponsor see their own, admin sees all)
 */
export const getCollaborations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    let filter: any = {};

    if (userRole === 'admin') {
      // Admin sees all
      filter = {};
    } else {
      // Organizer/Sponsor see their own
      filter = {
        $or: [
          { organizer: userId },
          { sponsor: userId },
        ],
      };
    }

    const collaborations = await Collaboration.find(filter)
      .populate('event', 'title startDate endDate')
      .populate('organizer', 'name email organizationName')
      .populate('sponsor', 'name email organizationName')
      .populate('proposal', 'proposedAmount proposedBenefits')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: collaborations,
      count: collaborations.length,
    });
  } catch (error: any) {
    console.error('Get collaborations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch collaborations',
    });
  }
};

/**
 * Get single collaboration
 * GET /api/collaborations/:id
 * Auth: Organizer/sponsor/admin
 */
export const getCollaborationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    const collaboration = await Collaboration.findById(id)
      .populate('event')
      .populate('organizer', 'name email organizationName')
      .populate('sponsor', 'name email organizationName')
      .populate('proposal');

    if (!collaboration) {
      res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
      return;
    }

    // Check access
    const isOrganizer = collaboration.organizer._id.toString() === userId;
    const isSponsor = collaboration.sponsor._id.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isOrganizer && !isSponsor && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this collaboration',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: collaboration,
    });
  } catch (error: any) {
    console.error('Get collaboration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch collaboration',
    });
  }
};

/**
 * Update collaboration status
 * PUT /api/collaborations/:id
 * Auth: Organizer/sponsor (owner only)
 */
export const updateCollaboration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, endDate, notes } = req.body;
    const userId = (req as any).user?.userId;

    const collaboration = await Collaboration.findById(id);

    if (!collaboration) {
      res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
      return;
    }

    // Check ownership
    const isOrganizer = collaboration.organizer.toString() === userId;
    const isSponsor = collaboration.sponsor.toString() === userId;

    if (!isOrganizer && !isSponsor) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own collaborations',
      });
      return;
    }

    // Update allowed fields
    if (status) {
      const validStatuses = ['active', 'completed', 'terminated'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: active, completed, or terminated',
        });
        return;
      }
      collaboration.status = status;
    }

    if (endDate) collaboration.endDate = new Date(endDate);
    if (notes) collaboration.notes = notes;

    await collaboration.save();
    await collaboration.populate([
      { path: 'event', select: 'title' },
      { path: 'organizer', select: 'name email' },
      { path: 'sponsor', select: 'name email' },
      { path: 'proposal', select: 'proposedAmount' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Collaboration updated successfully',
      data: collaboration,
    });
  } catch (error: any) {
    console.error('Update collaboration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update collaboration',
    });
  }
};
