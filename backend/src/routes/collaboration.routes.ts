import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getCollaborations,
  getCollaborationById,
  updateCollaboration,
} from '../controllers/collaboration.controller';

const router: Router = express.Router();

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
