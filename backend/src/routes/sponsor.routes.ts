import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { getSponsorProfile, updateSponsorProfile } from '../controllers/sponsor.controller';
import { getSponsorProposals } from '../controllers/proposal.controller';

const router: Router = express.Router();

/**
 * SPONSOR PROFILE
 */
router.get('/profile', authenticate, authorizeRoles('sponsor'), getSponsorProfile);
router.put('/profile', authenticate, authorizeRoles('sponsor'), updateSponsorProfile);

/**
 * SPONSOR PROPOSALS DASHBOARD
 */
router.get('/proposals', authenticate, authorizeRoles('sponsor'), getSponsorProposals);

export default router;
