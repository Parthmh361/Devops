import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import SponsorshipRequest from '../models/SponsorshipRequest.model';
import Notification from '../models/Notification.model';
import Event from '../models/Event.model';
import User from '../models/User.model';

/**
 * Get organizers related to an event
 * GET /api/events/:id/organizers
 */
export const getEventOrganizers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: 'Invalid event ID' });
            return;
        }

        const event = await Event.findById(id).populate('organizer', 'name organizationName email phone designation');

        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' });
            return;
        }

        // Wrap in array as requested: "A list should appear showing organizers related to that event"
        // Usually an event has one organizer, but we follow the structure
        res.status(200).json({
            success: true,
            data: [event.organizer],
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create a sponsorship request
 * POST /api/sponsorship/request
 */
export const createSponsorshipRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { eventId, organizerId, message } = req.body;
        const sponsorId = (req as any).user?.userId;

        if (!eventId || !organizerId) {
            res.status(400).json({ success: false, message: 'eventId and organizerId are required' });
            return;
        }

        if (!isValidObjectId(eventId) || !isValidObjectId(organizerId)) {
            res.status(400).json({ success: false, message: 'Invalid event or organizer ID' });
            return;
        }

        // Check if request already exists
        const existing = await SponsorshipRequest.findOne({ sponsor: sponsorId, event: eventId, organizer: organizerId });
        if (existing) {
            res.status(400).json({ success: false, message: 'Request already sent' });
            return;
        }

        const request = new SponsorshipRequest({
            sponsor: sponsorId,
            organizer: organizerId,
            event: eventId,
            status: 'pending',
            initiatedBy: 'sponsor',
            message: message || '',
        });

        await request.save();

        // Notify Organizer
        const sponsor = await User.findById(sponsorId);
        const event = await Event.findById(eventId);

        await Notification.create({
            user: organizerId,
            title: 'New Sponsorship Request',
            message: `New sponsorship request from ${sponsor?.name} for ${event?.title}.${message ? ` Proposal: ${message.slice(0, 50)}...` : ''}`,
            type: 'proposal',
            relatedEntity: { type: 'event', id: eventId }
        });

        res.status(201).json({ success: true, data: request });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get incoming requests for organizer
 * GET /api/organizer/requests
 */
export const getOrganizerRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const requests = await SponsorshipRequest.find({ organizer: userId })
            .populate('sponsor', 'name email organizationName')
            .populate('event', 'title date location')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: requests });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Accept request
 * PATCH /api/sponsorship/request/:id/accept
 */
export const acceptRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const organizerId = (req as any).user?.userId;

        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: 'Invalid request ID' });
            return;
        }

        const request = await SponsorshipRequest.findOne({ _id: id, organizer: organizerId });
        if (!request) {
            res.status(404).json({ success: false, message: 'Request not found' });
            return;
        }

        request.status = 'accepted';
        await request.save();

        // Notify Sponsor
        await Notification.create({
            user: request.sponsor,
            title: 'Request Accepted',
            message: 'Organizer accepted your sponsorship request',
            type: 'proposal',
            relatedEntity: { type: 'event', id: request.event }
        });

        res.status(200).json({ success: true, data: request });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Reject request
 * PATCH /api/sponsorship/request/:id/reject
 */
export const rejectRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const organizerId = (req as any).user?.userId;

        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: 'Invalid request ID' });
            return;
        }

        const request = await SponsorshipRequest.findOne({ _id: id, organizer: organizerId });
        if (!request) {
            res.status(404).json({ success: false, message: 'Request not found' });
            return;
        }

        request.status = 'rejected';
        await request.save();

        // Notify Sponsor
        await Notification.create({
            user: request.sponsor,
            title: 'Request Rejected',
            message: 'Organizer rejected your sponsorship request',
            type: 'proposal',
            relatedEntity: { type: 'event', id: request.event }
        });

        res.status(200).json({ success: true, data: request });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all sponsors
 * GET /api/sponsorship/sponsors
 */
export const getAllSponsors = async (_req: Request, res: Response): Promise<void> => {
    try {
        const sponsors = await User.find({ role: 'sponsor', isActive: true })
            .select('name organizationName email bio logo');

        res.status(200).json({ success: true, data: sponsors });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Invite sponsor (Organizer initiates)
 * POST /api/sponsorship/request/invite
 */
export const inviteSponsor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { eventId, sponsorId, message } = req.body;
        const organizerId = (req as any).user?.userId;

        if (!eventId || !sponsorId) {
            res.status(400).json({ success: false, message: 'eventId and sponsorId are required' });
            return;
        }

        if (!isValidObjectId(eventId) || !isValidObjectId(sponsorId)) {
            res.status(400).json({ success: false, message: 'Invalid event or sponsor ID' });
            return;
        }

        // Check if request already exists
        const existing = await SponsorshipRequest.findOne({ sponsor: sponsorId, event: eventId, organizer: organizerId });
        if (existing) {
            res.status(400).json({ success: false, message: 'Request already exists' });
            return;
        }

        const request = new SponsorshipRequest({
            sponsor: sponsorId,
            organizer: organizerId,
            event: eventId,
            status: 'pending',
            initiatedBy: 'organizer',
            message: message || '',
        });

        await request.save();

        // Notify Sponsor
        const organizer = await User.findById(organizerId);
        const event = await Event.findById(eventId);

        await Notification.create({
            user: sponsorId,
            title: 'Sponsorship Invitation',
            message: `You've been invited by ${organizer?.name} to sponsor ${event?.title}.${message ? ` Note: ${message.slice(0, 50)}...` : ''}`,
            type: 'proposal',
            relatedEntity: { type: 'event', id: eventId }
        });

        res.status(201).json({ success: true, data: request });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get sponsor's requests (both sent and received invitations)
 * GET /api/sponsorship/sponsor/requests
 */
export const getSponsorRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const requests = await SponsorshipRequest.find({ sponsor: userId })
            .populate('organizer', 'name email organizationName')
            .populate('event', 'title date location')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: requests });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Notifications
 * GET /api/notifications
 */
export const getMyNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
