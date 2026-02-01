import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import {
  getOverview,
  getTrends,
} from '../controllers/admin.analytics.controller';

const router: Router = express.Router();

/**
 * All routes require authentication and admin role
 * Read-only analytics endpoints
 */

// Get platform overview statistics
router.get('/overview', authenticate, authorizeRoles('admin'), getOverview);

// Get platform growth trends (last 6 months)
router.get('/trends', authenticate, authorizeRoles('admin'), getTrends);

export default router;
