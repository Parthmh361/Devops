import { Request, Response } from 'express';
import SponsorshipProposal from '../models/SponsorshipProposal.model';
import Collaboration from '../models/Collaboration.model';
import Notification from '../models/Notification.model';
import Event from '../models/Event.model';

/**
 * Create sponsorship proposal
 * POST /api/proposals
 * Auth: Sponsor required
 */
export const createProposal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, proposedAmount, proposedBenefits, message } = req.body;
    const sponsorId = (req as any).user?.userId;

    // Validate required fields
    if (!eventId || proposedAmount === undefined) {
      res.status(400).json({
        success: false,
        message: 'Event ID and proposed amount are required',
      });
      return;
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Check if already proposed by same sponsor
    const existingProposal = await SponsorshipProposal.findOne({
      event: eventId,
      sponsor: sponsorId,
    });

    if (existingProposal) {
      res.status(409).json({
        success: false,
        message: 'You have already submitted a proposal for this event',
      });
      return;
    }

    const newProposal = new SponsorshipProposal({
      event: eventId,
      sponsor: sponsorId,
      proposedAmount,
      proposedBenefits: proposedBenefits || [],
      message,
      status: 'pending',
    });

    await newProposal.save();
    await newProposal.populate([
      { path: 'event', select: 'title' },
      { path: 'sponsor', select: 'name email organizationName' },
    ]);

    // Create notification for organizer
    const organizerNotification = new Notification({
      user: event.organizer,
      title: 'New Sponsorship Proposal',
      message: `New sponsorship proposal received for event: ${event.title}`,
      type: 'proposal',
      relatedEntity: {
        type: 'proposal',
        id: newProposal._id,
      },
    });
    await organizerNotification.save();

    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully',
      data: newProposal,
    });
  } catch (error: any) {
    console.error('Create proposal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create proposal',
    });
  }
};

/**
 * Get proposals for an event (organizer only)
 * GET /api/proposals?eventId=:eventId
 * Auth: Organizer of the event
 */
export const getProposals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, status } = req.query;
    const userId = (req as any).user?.userId;

    if (!eventId) {
      res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
      return;
    }

    // Check if user is the event organizer
    const event = await Event.findById(eventId);
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
        message: 'You can only view proposals for your own events',
      });
      return;
    }

    const filter: any = { event: eventId };
    if (status) filter.status = status;

    const proposals = await SponsorshipProposal.find(filter)
      .populate('sponsor', 'name email organizationName')
      .populate('event', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: proposals,
      count: proposals.length,
    });
  } catch (error: any) {
    console.error('Get proposals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch proposals',
    });
  }
};

/**
 * Get sponsor's own proposals
 * GET /api/proposals/my-proposals
 * Auth: Sponsor required
 */
export const getMyProposals = async (req: Request, res: Response): Promise<void> => {
  try {
    const sponsorId = (req as any).user?.userId;

    const proposals = await SponsorshipProposal.find({ sponsor: sponsorId })
      .populate('event', 'title startDate endDate')
      .populate('sponsor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: proposals,
      count: proposals.length,
    });
  } catch (error: any) {
    console.error('Get my proposals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch proposals',
    });
  }
};

/**
 * Get single proposal
 * GET /api/proposals/:id
 * Auth: Organizer or sponsor of the proposal
 */
export const getProposalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const proposal = await SponsorshipProposal.findById(id)
      .populate('event', 'title description')
      .populate('sponsor', 'name email organizationName');

    if (!proposal) {
      res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
      return;
    }

    // Check access: organizer of event or sponsor
    const event = await Event.findById(proposal.event._id);
    const isOrganizer = event?.organizer.toString() === userId;
    const isSponsor = proposal.sponsor._id.toString() === userId;

    if (!isOrganizer && !isSponsor) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this proposal',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: proposal,
    });
  } catch (error: any) {
    console.error('Get proposal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch proposal',
    });
  }
};

/**
 * Respond to proposal (accept/reject/negotiate)
 * PUT /api/proposals/:id
 * Auth: Organizer of the event
 */
export const respondToProposal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user?.userId;

    const proposal = await SponsorshipProposal.findById(id);

    if (!proposal) {
      res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
      return;
    }

    // Check if user is the event organizer
    const event = await Event.findById(proposal.event._id);
    if (event?.organizer.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only respond to proposals for your own events',
      });
      return;
    }

    const validStatuses = ['accepted', 'rejected', 'negotiation'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: accepted, rejected, or negotiation',
      });
      return;
    }

    proposal.status = status;
    await proposal.save();

    // If accepted, create collaboration
    if (status === 'accepted') {
      const collaboration = new Collaboration({
        event: proposal.event._id,
        organizer: event?.organizer,
        sponsor: proposal.sponsor,
        proposal: proposal._id,
        startDate: new Date(),
      });
      await collaboration.save();

      // Create notifications
      const sponsorNotification = new Notification({
        user: proposal.sponsor,
        title: 'Proposal Accepted',
        message: `Your sponsorship proposal for event "${event?.title}" has been accepted!`,
        type: 'proposal',
        relatedEntity: {
          type: 'proposal',
          id: proposal._id,
        },
      });
      await sponsorNotification.save();
    } else if (status === 'rejected') {
      const sponsorNotification = new Notification({
        user: proposal.sponsor,
        title: 'Proposal Rejected',
        message: `Your sponsorship proposal for event "${event?.title}" has been rejected.`,
        type: 'proposal',
        relatedEntity: {
          type: 'proposal',
          id: proposal._id,
        },
      });
      await sponsorNotification.save();
    }

    await proposal.populate([
      { path: 'event', select: 'title' },
      { path: 'sponsor', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: `Proposal ${status} successfully`,
      data: proposal,
    });
  } catch (error: any) {
    console.error('Respond to proposal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to respond to proposal',
    });
  }
};
