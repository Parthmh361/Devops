import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import {
  createProposal,
  getMyProposals,
  getProposalById,
  acceptProposal,
  rejectProposal,
  negotiateProposal,
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
 * SHARED ROUTES
 */
// Get single proposal (organizer or sponsor)
router.get('/:id', authenticate, getProposalById);

/**
 * ORGANIZER ACTIONS
 */
// Accept proposal
router.patch('/:id/accept', authenticate, authorizeRoles('organizer'), acceptProposal);

// Reject proposal
router.patch('/:id/reject', authenticate, authorizeRoles('organizer'), rejectProposal);

// Negotiate proposal
router.patch('/:id/negotiate', authenticate, authorizeRoles('organizer'), negotiateProposal);

export default router;
