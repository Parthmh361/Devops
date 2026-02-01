import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
  publishEvent,
  approveEvent,
  updateSponsorshipRequirements,
} from '../controllers/event.controller';

const router: Router = express.Router();

/**
 * PUBLIC ROUTES
 */
// Get all published & approved events
router.get('/', getEvents);

// Get organizer's events
router.get('/my', authenticate, authorizeRoles('organizer'), getMyEvents);

// Get single event (public for published, auth for others)
router.get('/:id', getEventById);

/**
 * ORGANIZER ROUTES
 */
// Create event (organizer required)
router.post('/', authenticate, authorizeRoles('organizer'), createEvent);

// Update event (organizer only)
router.put('/:id', authenticate, authorizeRoles('organizer'), updateEvent);

// Delete event (organizer only)
router.delete('/:id', authenticate, authorizeRoles('organizer'), deleteEvent);

// Publish event (organizer only)
router.patch('/:id/publish', authenticate, authorizeRoles('organizer'), publishEvent);

// Approve event (admin only)
router.post('/:id/approve', authenticate, authorizeRoles('admin'), approveEvent);

// Update sponsorship requirements (organizer only)
router.put(
  '/:id/sponsorship-requirements',
  authenticate,
  authorizeRoles('organizer'),
  updateSponsorshipRequirements
);

export default router;
