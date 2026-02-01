import express, { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles, adminOnly, organizerOrAdmin } from '../middlewares/role.middleware';

const router: Router = express.Router();

/**
 * EXAMPLE PROTECTED ROUTES
 * Demonstrating authentication and role-based authorization
 */

/**
 * GET /api/examples/protected
 * Example: Protected route requiring authentication only
 * Any authenticated user can access
 */
router.get(
  '/protected',
  authenticate,
  (req: Request, res: Response): void => {
    res.json({
      message: 'This is a protected route',
      currentUser: req.user,
    });
  }
);

/**
 * GET /api/examples/admin-only
 * Example: Admin-only route
 * Only users with 'admin' role can access
 */
router.get(
  '/admin-only',
  authenticate,
  adminOnly,
  (req: Request, res: Response): void => {
    res.json({
      message: 'Admin-only content',
      admin: req.user,
    });
  }
);

/**
 * POST /api/examples/create-event
 * Example: Organizer or Admin can create events
 * Users with 'organizer' or 'admin' role can access
 */
router.post(
  '/create-event',
  authenticate,
  organizerOrAdmin,
  (req: Request, res: Response): void => {
    res.json({
      message: 'Event created successfully',
      creator: req.user,
      eventData: req.body,
    });
  }
);

/**
 * PUT /api/examples/sponsor/:id
 * Example: Using authorizeRoles with specific roles
 * Only sponsors or admin can update sponsorship
 */
router.put(
  '/sponsor/:id',
  authenticate,
  authorizeRoles('sponsor', 'admin'),
  (req: Request, res: Response): void => {
    res.json({
      message: 'Sponsorship updated',
      sponsorshipId: req.params.id,
      updatedBy: req.user,
    });
  }
);

/**
 * DELETE /api/examples/user/:id
 * Example: Admin-only deletion
 */
router.delete(
  '/user/:id',
  authenticate,
  adminOnly,
  (req: Request, res: Response): void => {
    res.json({
      message: 'User deleted successfully',
      userId: req.params.id,
      deletedBy: req.user,
    });
  }
);

/**
 * GET /api/examples/user-role
 * Example: Check user's role and return role-specific data
 */
router.get(
  '/user-role',
  authenticate,
  (req: Request, res: Response): void => {
    const userRole = req.user?.role;

    let responseData = {};

    switch (userRole) {
      case 'admin':
        responseData = {
          message: 'Admin panel data',
          permissions: ['manage_users', 'manage_events', 'manage_sponsorships'],
        };
        break;
      case 'organizer':
        responseData = {
          message: 'Organizer dashboard data',
          permissions: ['create_event', 'manage_own_events', 'request_sponsorship'],
        };
        break;
      case 'sponsor':
        responseData = {
          message: 'Sponsor dashboard data',
          permissions: ['browse_events', 'propose_sponsorship', 'manage_proposals'],
        };
        break;
      default:
        responseData = { message: 'Unknown role' };
    }

    res.json({
      userRole,
      ...responseData,
    });
  }
);

export default router;
