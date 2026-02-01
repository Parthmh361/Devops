import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { getOrganizerProfile, updateOrganizerProfile } from '../controllers/organizer.controller';
import { getOrganizerProposals } from '../controllers/proposal.controller';

const router: Router = express.Router();

/**
 * ORGANIZER PROFILE
 */
router.get('/profile', authenticate, authorizeRoles('organizer'), getOrganizerProfile);
router.put('/profile', authenticate, authorizeRoles('organizer'), updateOrganizerProfile);

/**
 * ORGANIZER PROPOSALS
 */
router.get('/proposals', authenticate, authorizeRoles('organizer'), getOrganizerProposals);

export default router;
