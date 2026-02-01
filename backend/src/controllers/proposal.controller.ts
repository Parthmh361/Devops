import { Request, Response } from 'express';
import mongoose from 'mongoose';
import SponsorshipProposal from '../models/SponsorshipProposal.model';
import Collaboration from '../models/Collaboration.model';
import Event from '../models/Event.model';

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

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

    if (!isValidObjectId(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
      return;
    }

    if (Number(proposedAmount) <= 0) {
      res.status(400).json({
        success: false,
        message: 'Proposed amount must be greater than 0',
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

    if (event.status !== 'published' || event.isApproved !== true) {
      res.status(403).json({
        success: false,
        message: 'You can only propose to published and approved events',
      });
      return;
    }

    // Check if already has an active (non-terminal) proposal for this event
    const existingProposal = await SponsorshipProposal.findOne({
      event: eventId,
      sponsor: sponsorId,
      status: { $in: ['pending', 'negotiation'] }, // Only block if there's an active proposal
    });

    if (existingProposal) {
      res.status(409).json({
        success: false,
        message: 'You already have an active proposal for this event. Please wait for a response or withdraw it first.',
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
 * Get proposals for organizer's events
 * GET /api/organizer/proposals
 * Auth: Organizer only
 */
export const getOrganizerProposals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, status } = req.query;
    const userId = (req as any).user?.userId;

    let eventIds: string[] = [];

    if (eventId) {
      if (!isValidObjectId(String(eventId))) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID',
        });
        return;
      }

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

      eventIds = [event._id.toString()];
    } else {
      const organizerEvents = await Event.find({ organizer: userId }).select('_id');
      eventIds = organizerEvents.map((e) => e._id.toString());
    }

    const filter: any = { event: { $in: eventIds } };
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
      .populate('event', 'title startDate endDate category eventMode')
      .populate('sponsor', 'name email')
      .sort({ createdAt: -1 })
      .lean();

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
 * Get sponsor proposals dashboard
 * GET /api/sponsor/proposals
 * Auth: Sponsor only
 */
export const getSponsorProposals = async (req: Request, res: Response): Promise<void> => {
  try {
    const sponsorId = (req as any).user?.userId;
    const { status, eventId } = req.query;

    const filter: any = { sponsor: sponsorId };

    if (status) {
      filter.status = status;
    }

    if (eventId) {
      if (!isValidObjectId(String(eventId))) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID',
        });
        return;
      }
      filter.event = eventId;
    }

    const proposals = await SponsorshipProposal.find(filter)
      .populate('event', 'title startDate endDate category eventMode status isApproved')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: proposals,
      count: proposals.length,
    });
  } catch (error: any) {
    console.error('Get sponsor proposals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sponsor proposals',
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

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid proposal ID',
      });
      return;
    }

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
 * Accept proposal (organizer)
 * PATCH /api/proposals/:id/accept
 * Auth: Organizer of the event
 */
export const acceptProposal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid proposal ID',
      });
      return;
    }

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
        message: 'You can only accept proposals for your own events',
      });
      return;
    }

    proposal.status = 'accepted';
    await proposal.save();

    const existingCollaboration = await Collaboration.findOne({ proposal: proposal._id });
    let collaboration;
    
    if (!existingCollaboration) {
      collaboration = new Collaboration({
        event: proposal.event._id,
        organizer: event?.organizer,
        sponsor: proposal.sponsor,
        proposal: proposal._id,
      });
      await collaboration.save();
    } else {
      collaboration = existingCollaboration;
    }

    await proposal.populate([
      { path: 'event', select: 'title' },
      { path: 'sponsor', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Proposal accepted successfully',
      data: {
        ...proposal.toObject(),
        collaboration: collaboration._id,
      },
    });
  } catch (error: any) {
    console.error('Accept proposal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to accept proposal',
    });
  }
};

/**
 * Reject proposal (organizer)
 * PATCH /api/proposals/:id/reject
 * Auth: Organizer of the event
 */
export const rejectProposal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?.userId;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid proposal ID',
      });
      return;
    }

    const proposal = await SponsorshipProposal.findById(id);

    if (!proposal) {
      res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
      return;
    }

    const event = await Event.findById(proposal.event._id);
    if (event?.organizer.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only reject proposals for your own events',
      });
      return;
    }

    proposal.status = 'rejected';
    if (reason) {
      proposal.responseNote = reason;
    }
    await proposal.save();

    await proposal.populate([
      { path: 'event', select: 'title' },
      { path: 'sponsor', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Proposal rejected successfully',
      data: proposal,
    });
  } catch (error: any) {
    console.error('Reject proposal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject proposal',
    });
  }
};

/**
 * Negotiate proposal (organizer)
 * PATCH /api/proposals/:id/negotiate
 * Auth: Organizer of the event
 */
export const negotiateProposal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid proposal ID',
      });
      return;
    }

    const proposal = await SponsorshipProposal.findById(id);

    if (!proposal) {
      res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
      return;
    }

    const event = await Event.findById(proposal.event._id);
    if (event?.organizer.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only negotiate proposals for your own events',
      });
      return;
    }

    proposal.status = 'negotiation';
    await proposal.save();

    await proposal.populate([
      { path: 'event', select: 'title' },
      { path: 'sponsor', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Proposal moved to negotiation',
      data: proposal,
    });
  } catch (error: any) {
    console.error('Negotiate proposal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to negotiate proposal',
    });
  }
};
