import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles, adminOnly } from '../middlewares/role.middleware';
import {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
  publishEvent,
  approveEvent,
} from '../controllers/event.controller';

const router: Router = express.Router();

/**
 * PUBLIC ROUTES
 */
// Get all published & approved events
router.get('/', getEvents);

// Get single event (public for published, auth for others)
router.get('/:id', getEventById);

/**
 * ORGANIZER ROUTES
 */
// Create event (organizer required)
router.post('/', authenticate, authorizeRoles('organizer'), createEvent);

// Get organizer's events
router.get('/organizer/my-events', authenticate, authorizeRoles('organizer'), getMyEvents);

// Update event (organizer only)
router.put('/:id', authenticate, authorizeRoles('organizer'), updateEvent);

// Delete event (organizer only)
router.delete('/:id', authenticate, authorizeRoles('organizer'), deleteEvent);

// Publish event (organizer only)
router.post('/:id/publish', authenticate, authorizeRoles('organizer'), publishEvent);

/**
 * ADMIN ROUTES
 */
// Approve/reject event (admin only)
router.post('/:id/approve', authenticate, adminOnly, approveEvent);

export default router;
