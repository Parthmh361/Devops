import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import {
  getAllEvents,
  approveEvent,
  rejectEvent,
} from '../controllers/admin.event.controller';

const router: Router = express.Router();

/**
 * All routes require authentication and admin role
 */

// Get all events (any status) with filters and pagination
// Query params: status, isApproved, eventMode, search, page, limit
router.get('/', authenticate, authorizeRoles('admin'), getAllEvents);

// Approve an event
router.patch('/:id/approve', authenticate, authorizeRoles('admin'), approveEvent);

// Reject an event (requires reason in body)
router.patch('/:id/reject', authenticate, authorizeRoles('admin'), rejectEvent);

export default router;
