import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import {
    getEventOrganizers,
    createSponsorshipRequest,
    getOrganizerRequests,
    acceptRequest,
    rejectRequest,
    getAllSponsors,
    inviteSponsor,
    getSponsorRequests,
} from '../controllers/sponsorship.controller';

const router: Router = express.Router();

// Get organizers for an event (Public or Auth)
router.get('/event/:id/organizers', authenticate, getEventOrganizers);

// Create request (Sponsor only)
router.post('/request', authenticate, authorizeRoles('sponsor'), createSponsorshipRequest);

// Organizer actions
router.get('/organizer/requests', authenticate, authorizeRoles('organizer'), getOrganizerRequests);
router.get('/sponsors', authenticate, authorizeRoles('organizer'), getAllSponsors);
router.post('/request/invite', authenticate, authorizeRoles('organizer'), inviteSponsor);
router.patch('/request/:id/accept', authenticate, authorizeRoles('organizer'), acceptRequest);
router.patch('/request/:id/reject', authenticate, authorizeRoles('organizer'), rejectRequest);

// Sponsor actions
router.get('/sponsor/requests', authenticate, authorizeRoles('sponsor'), getSponsorRequests);

export default router;
