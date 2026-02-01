import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import {
  createProposal,
  getProposals,
  getMyProposals,
  getProposalById,
  respondToProposal,
} from '../controllers/proposal.controller';

const router: Router = express.Router();

/**
 * SPONSOR ROUTES
 */
// Create sponsorship proposal (sponsor required)
router.post('/', authenticate, authorizeRoles('sponsor'), createProposal);

// Get sponsor's own proposals
router.get('/my-proposals', authenticate, authorizeRoles('sponsor'), getMyProposals);

/**
 * ORGANIZER ROUTES
 */
// Get proposals for an event (organizer only)
router.get('/', authenticate, authorizeRoles('organizer'), getProposals);

// Respond to proposal (accept/reject/negotiate)
router.put('/:id', authenticate, authorizeRoles('organizer'), respondToProposal);

/**
 * SHARED ROUTES
 */
// Get single proposal (organizer or sponsor)
router.get('/:id', authenticate, getProposalById);

export default router;
