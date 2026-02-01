import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Collaboration from '../models/Collaboration.model';

/**
 * Get collaborations (user's or all for admin)
 * GET /api/collaborations
 * Auth: Authenticated (organizer/sponsor see their own, admin sees all)
 */
export const getCollaborations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

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
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    // Validate collaboration ID
    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid collaboration ID',
      });
      return;
    }

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
    const userId = (req as any).userId;

    // Validate collaboration ID
    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid collaboration ID',
      });
      return;
    }

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
      const validStatuses = ['pending', 'active', 'completed', 'terminated'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: pending, active, completed, or terminated',
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

/**
 * PATCH /api/collaborations/:id/activate
 * Activate a collaboration (pending → active)
 * Auth: Organizer only
 */
export const activateCollaboration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Validate collaboration ID
    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid collaboration ID',
      });
      return;
    }

    const collaboration = await Collaboration.findById(id);

    if (!collaboration) {
      res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
      return;
    }

    // Only organizer can activate
    if (collaboration.organizer.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only the organizer can activate a collaboration',
      });
      return;
    }

    // Validate state transition: pending → active
    if ((collaboration.status as any) !== 'pending') {
      res.status(400).json({
        success: false,
        message: `Cannot activate collaboration in ${collaboration.status} state. Must be in pending state.`,
      });
      return;
    }

    // Update status and set start date
    collaboration.status = 'active';
    collaboration.startDate = new Date();
    await collaboration.save();

    await collaboration.populate([
      { path: 'event', select: 'title' },
      { path: 'organizer', select: 'name email' },
      { path: 'sponsor', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Collaboration activated successfully',
      data: collaboration,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/collaborations/:id/complete
 * Mark collaboration as completed (active → completed)
 * Auth: Organizer or Sponsor
 */
export const completeCollaboration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Validate collaboration ID
    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid collaboration ID',
      });
      return;
    }

    const collaboration = await Collaboration.findById(id);

    if (!collaboration) {
      res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
      return;
    }

    // Organizer or Sponsor can complete
    const isParticipant =
      collaboration.organizer.toString() === userId ||
      collaboration.sponsor.toString() === userId;

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'Only collaboration participants can mark it as completed',
      });
      return;
    }

    // Validate state transition: active → completed
    if (collaboration.status !== 'active') {
      res.status(400).json({
        success: false,
        message: `Cannot complete collaboration in ${collaboration.status} state. Must be in active state.`,
      });
      return;
    }

    // Update status and set end date
    collaboration.status = 'completed';
    collaboration.endDate = new Date();
    await collaboration.save();

    await collaboration.populate([
      { path: 'event', select: 'title' },
      { path: 'organizer', select: 'name email' },
      { path: 'sponsor', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Collaboration marked as completed',
      data: collaboration,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/collaborations/:id/terminate
 * Terminate a collaboration (active → terminated)
 * Auth: Organizer only
 */
export const terminateCollaboration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { reason } = req.body;

    // Validate collaboration ID
    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid collaboration ID',
      });
      return;
    }

    const collaboration = await Collaboration.findById(id);

    if (!collaboration) {
      res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
      return;
    }

    // Only organizer can terminate
    if (collaboration.organizer.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only the organizer can terminate a collaboration',
      });
      return;
    }

    // Validate state transition: active → terminated
    if (collaboration.status !== 'active') {
      res.status(400).json({
        success: false,
        message: `Cannot terminate collaboration in ${collaboration.status} state. Must be in active state.`,
      });
      return;
    }

    // Update status, end date, and notes
    collaboration.status = 'terminated';
    collaboration.endDate = new Date();
    if (reason) {
      collaboration.notes = `Terminated: ${reason}`;
    }
    await collaboration.save();

    await collaboration.populate([
      { path: 'event', select: 'title' },
      { path: 'organizer', select: 'name email' },
      { path: 'sponsor', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Collaboration terminated successfully',
      data: collaboration,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
