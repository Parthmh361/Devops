import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.model';

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

/**
 * Create a new event
 * POST /api/events
 * Auth: Organizer required
 */
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, startDate, endDate, date, amountRequired, location, eventMode, sponsorshipNeeds } = req.body;
    const userId = (req as any).user?.userId;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !date || amountRequired === undefined) {
      res.status(400).json({
        success: false,
        message: 'Title, description, startDate, endDate, date, and amountRequired are required',
      });
      return;
    }

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
      return;
    }

    const newEvent = new Event({
      title,
      description,
      category,
      startDate,
      endDate,
      date,
      amountRequired,
      location,
      eventMode: eventMode || 'offline',
      sponsorshipNeeds: sponsorshipNeeds || { tiers: [], categories: [], customBenefits: [] },
      organizer: userId,
      status: 'published',
      isApproved: true,
    });

    await newEvent.save();
    await newEvent.populate('organizer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent,
    });
  } catch (error: any) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create event',
    });
  }
};

/**
 * Get all public events (published & approved)
 * GET /api/events
 * Auth: None (public)
 */
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      eventMode,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      page = '1',
      limit = '10',
    } = req.query;

    const filter: any = { status: 'published', isApproved: true };

    if (category) filter.category = category;
    if (eventMode) filter.eventMode = eventMode;

    if (search && String(search).trim().length > 0) {
      const searchValue = String(search).trim();
      filter.$or = [
        { title: { $regex: searchValue, $options: 'i' } },
        { description: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const amountFilter: any = {};
    if (minAmount !== undefined) amountFilter.$gte = Number(minAmount);
    if (maxAmount !== undefined) amountFilter.$lte = Number(maxAmount);
    if (Object.keys(amountFilter).length > 0) {
      filter['sponsorshipNeeds.tiers'] = { $elemMatch: { amount: amountFilter } };
    }

    if (startDate) {
      filter.startDate = { ...(filter.startDate || {}), $gte: new Date(String(startDate)) };
    }
    if (endDate) {
      filter.endDate = { ...(filter.endDate || {}), $lte: new Date(String(endDate)) };
    }

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'name email organizationName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Event.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch events',
    });
  }
};

/**
 * Get single event
 * GET /api/events/:id
 * Auth: None (public for published, organizer/admin for drafts)
 */
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
      return;
    }

    const event = await Event.findById(id)
      .populate('organizer', 'name email organizationName')
      .populate({
        path: 'sponsorshipNeeds',
      });

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Check access: public if published & approved, otherwise only organizer/admin
    const isPublic = event.status === 'published' && event.isApproved;
    const isOwner = event.organizer._id.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isPublic && !isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this event',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch event',
    });
  }
};

/**
 * Get organizer's events
 * GET /api/events/my
 * Auth: Organizer required
 */
export const getMyEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    const events = await Event.find({ organizer: userId })
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error: any) {
    console.error('Get my events error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch your events',
    });
  }
};

/**
 * Update event
 * PUT /api/events/:id
 * Auth: Organizer (owner only)
 */
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const { title, description, category, startDate, endDate, date, amountRequired, location, eventMode, sponsorshipNeeds } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
      return;
    }

    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Check ownership
    if (event.organizer.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own events',
      });
      return;
    }

    // Closed events cannot be updated
    if (event.status === 'closed') {
      res.status(400).json({
        success: false,
        message: 'Closed events cannot be updated',
      });
      return;
    }

    // Update allowed fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (startDate) event.startDate = new Date(startDate);
    if (endDate) event.endDate = new Date(endDate);
    if (date) event.date = new Date(date);
    if (amountRequired !== undefined) event.amountRequired = amountRequired;
    if (location) event.location = location;
    if (eventMode) event.eventMode = eventMode;
    if (sponsorshipNeeds) event.sponsorshipNeeds = sponsorshipNeeds;

    await event.save();
    await event.populate('organizer', 'name email');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error: any) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update event',
    });
  }
};

/**
 * Delete event
 * DELETE /api/events/:id
 * Auth: Organizer (owner only)
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
      return;
    }

    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Check ownership
    if (event.organizer.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own events',
      });
      return;
    }

    // Published events cannot be deleted
    if (event.status === 'published') {
      res.status(400).json({
        success: false,
        message: 'Published events cannot be deleted',
      });
      return;
    }

    await Event.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete event',
    });
  }
};

/**
 * Publish event
 * POST /api/events/:id/publish
 * Auth: Organizer (owner only)
 */
export const publishEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
      return;
    }

    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Check ownership
    if (event.organizer.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only publish your own events',
      });
      return;
    }

    if (event.status === 'published') {
      res.status(400).json({
        success: false,
        message: 'Event is already published',
      });
      return;
    }

    event.status = 'published';
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event published successfully',
      data: event,
    });
  } catch (error: any) {
    console.error('Publish event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to publish event',
    });
  }
};

/**
 * Approve event (admin only)
 * POST /api/events/:id/approve
 * Auth: Admin required
 */
export const approveEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
      return;
    }

    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    event.isApproved = isApproved === true;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Event ${isApproved ? 'approved' : 'rejected'} successfully`,
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
 * Update sponsorship requirements
 * PUT /api/events/:id/sponsorship-requirements
 * Auth: Organizer (owner only)
 */
export const updateSponsorshipRequirements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const { tiers, categories, customBenefits } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
      return;
    }

    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    if (event.organizer.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own events',
      });
      return;
    }

    if (!['draft', 'published'].includes(event.status)) {
      res.status(400).json({
        success: false,
        message: 'Sponsorship requirements can only be updated for draft or published events',
      });
      return;
    }

    event.sponsorshipNeeds = {
      tiers: Array.isArray(tiers) ? tiers : event.sponsorshipNeeds?.tiers || [],
      categories: Array.isArray(categories) ? categories : event.sponsorshipNeeds?.categories || [],
      customBenefits: Array.isArray(customBenefits) ? customBenefits : event.sponsorshipNeeds?.customBenefits || [],
    };

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Sponsorship requirements updated successfully',
      data: event,
    });
  } catch (error: any) {
    console.error('Update sponsorship requirements error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update sponsorship requirements',
    });
  }
};
