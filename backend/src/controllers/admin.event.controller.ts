import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Event from '../models/Event.model';

/**
 * GET /api/admin/events
 * Get all events (any status) with filters and pagination
 * Auth: Admin only
 */
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      isApproved,
      eventMode,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (status && typeof status === 'string') {
      if (!['draft', 'published', 'closed'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: draft, published, or closed',
        });
        return;
      }
      filter.status = status;
    }

    if (isApproved !== undefined) {
      filter.isApproved = isApproved === 'true';
    }

    if (eventMode && typeof eventMode === 'string') {
      if (!['online', 'offline', 'hybrid'].includes(eventMode)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event mode. Must be: online, offline, or hybrid',
        });
        return;
      }
      filter.eventMode = eventMode;
    }

    // Search by title or description
    if (search && typeof search === 'string') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'name email organizationName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Event.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch events',
    });
  }
};

/**
 * PATCH /api/admin/events/:id/approve
 * Approve an event (makes it publicly visible)
 * Auth: Admin only
 */
export const approveEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
      return;
    }

    const event = await Event.findById(id).populate('organizer', 'name email');

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Check if event is published
    if (event.status !== 'published') {
      res.status(400).json({
        success: false,
        message: 'Only published events can be approved. Current status: ' + event.status,
      });
      return;
    }

    // Check if already approved
    if (event.isApproved) {
      res.status(400).json({
        success: false,
        message: 'Event is already approved',
      });
      return;
    }

    event.isApproved = true;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event approved successfully',
      data: event,
    });
  } catch (error: any) {
    console.error('Approve event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve event',
    });
  }
};

/**
 * PATCH /api/admin/events/:id/reject
 * Reject an event with reason
 * Body: { reason: string }
 * Auth: Admin only
 */
export const rejectEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
      return;
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
      return;
    }

    const event = await Event.findById(id).populate('organizer', 'name email');

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Set status back to draft and mark as not approved
    event.status = 'draft';
    event.isApproved = false;
    await event.save();

    // In a real application, you might want to:
    // 1. Store the rejection reason in a separate field or collection
    // 2. Send notification to the organizer
    // For now, we'll just return the reason in the response

    res.status(200).json({
      success: true,
      message: 'Event rejected successfully',
      data: {
        event,
        rejectionReason: reason.trim(),
      },
    });
  } catch (error: any) {
    console.error('Reject event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject event',
    });
  }
};
