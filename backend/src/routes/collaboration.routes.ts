import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import {
  getCollaborations,
  getCollaborationById,
  updateCollaboration,
  activateCollaboration,
  completeCollaboration,
  terminateCollaboration,
} from '../controllers/collaboration.controller';

const router: Router = express.Router();

/**
 * STATE MACHINE ROUTES - Collaboration Lifecycle
 * MUST come FIRST before generic /:id routes
 */
// Activate collaboration: pending → active (organizer only)
router.patch('/:id/activate', authenticate, authorizeRoles('organizer'), activateCollaboration);

// Complete collaboration: active → completed (organizer or sponsor)
router.patch('/:id/complete', authenticate, completeCollaboration);

// Terminate collaboration: active → terminated (organizer only)
router.patch('/:id/terminate', authenticate, authorizeRoles('organizer'), terminateCollaboration);

/**
 * AUTHENTICATED ROUTES
 */
// Get collaborations (user sees their own, admin sees all)
router.get('/', authenticate, getCollaborations);

// Get single collaboration
router.get('/:id', authenticate, getCollaborationById);

// Update collaboration (organizer/sponsor only)
router.put('/:id', authenticate, updateCollaboration);

export default router;
