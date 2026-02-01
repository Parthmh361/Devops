/**
 * TEMPLATE: Using Auth in Your Domain Routes
 * Copy and adapt this for Events, Sponsorships, Users, etc.
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

/**
 * ═══════════════════════════════════════════════════════════════════
 * PATTERN 1: Public Route (No Auth)
 * ═══════════════════════════════════════════════════════════════════
 */

// GET /api/events
// Anyone can view published events
router.get('/events', async (req: Request, res: Response) => {
  try {
    // No authentication required
    // req.user is undefined here

    // Fetch published events
    const events = await EventModel.find({ isPublished: true });

    res.json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * PATTERN 2: Protected Route (Auth Only)
 * ═══════════════════════════════════════════════════════════════════
 */

// GET /api/events/my-events
// Get current user's events (any authenticated user)
router.get(
  '/my-events',
  authenticate, // Only authenticated users
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId; // req.user is guaranteed by middleware
      const userEmail = req.user!.email;

      // Fetch user's events
      const myEvents = await EventModel.find({ createdBy: userId });

      res.json({
        success: true,
        data: myEvents,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * ═══════════════════════════════════════════════════════════════════
 * PATTERN 3: Role-Based Access (Organizers Only)
 * ═══════════════════════════════════════════════════════════════════
 */

// POST /api/events
// Create event (only organizers)
router.post(
  '/events',
  authenticate,
  authorizeRoles('organizer'), // Only organizers can create events
  async (req: Request, res: Response) => {
    try {
      const organizerId = req.user!.userId;
      const { eventName, date, venue, sponsorshipBudget } = req.body;

      // Validate input
      if (!eventName || !date || !venue) {
        res.status(400).json({
          success: false,
          message: 'Name, date, and venue are required',
        });
        return;
      }

      // Create event
      const event = await EventModel.create({
        eventName,
        date,
        venue,
        sponsorshipBudget,
        createdBy: organizerId,
        createdByEmail: req.user!.email,
        status: 'draft',
      });

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * ═══════════════════════════════════════════════════════════════════
 * PATTERN 4: Multiple Roles (Organizer or Admin)
 * ═══════════════════════════════════════════════════════════════════
 */

// PUT /api/events/:id
// Update event (organizer owner or admin)
router.put(
  '/events/:id',
  authenticate,
  authorizeRoles('organizer', 'admin'), // Both roles allowed
  async (req: Request, res: Response) => {
    try {
      const eventId = req.params.id;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { eventName, date, venue } = req.body;

      // Fetch event
      const event = await EventModel.findById(eventId);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      // Check ownership or admin role
      if (event.createdBy !== userId && userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You can only update your own events',
        });
        return;
      }

      // Update event
      const updatedEvent = await EventModel.findByIdAndUpdate(
        eventId,
        { eventName, date, venue, updatedAt: new Date() },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * ═══════════════════════════════════════════════════════════════════
 * PATTERN 5: Admin Only
 * ═══════════════════════════════════════════════════════════════════
 */

// DELETE /api/events/:id
// Delete event (admin only)
router.delete(
  '/events/:id',
  authenticate,
  authorizeRoles('admin'), // Only admin
  async (req: Request, res: Response) => {
    try {
      const eventId = req.params.id;

      const deletedEvent = await EventModel.findByIdAndDelete(eventId);

      if (!deletedEvent) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Event deleted successfully',
        data: deletedEvent,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * ═══════════════════════════════════════════════════════════════════
 * PATTERN 6: Role-Based Response Data
 * ═══════════════════════════════════════════════════════════════════
 */

// GET /api/events/:id
// Get event details (role-specific info)
router.get(
  '/events/:id',
  authenticate, // Optional auth (see below)
  async (req: Request, res: Response) => {
    try {
      const eventId = req.params.id;
      const userRole = req.user?.role; // May be undefined if not authenticated

      const event = await EventModel.findById(eventId);

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      // Different data based on user role
      let responseData = {
        ...event.toObject(),
      };

      if (userRole === 'admin') {
        // Admin sees all data including internal analytics
        responseData.internalAnalytics = {
          viewCount: 1234,
          applicationCount: 45,
        };
      } else if (userRole === 'organizer') {
        // Organizer sees sponsorship details
        responseData.sponsorshipRequirements = event.sponsorshipRequirements;
      } else if (userRole === 'sponsor') {
        // Sponsor sees limited info
        delete (responseData as any).internalData;
      }
      // Unauthenticated users see public info only

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * ═══════════════════════════════════════════════════════════════════
 * PATTERN 7: Sponsors Proposing Sponsorship
 * ═══════════════════════════════════════════════════════════════════
 */

// POST /api/sponsorships
// Create sponsorship proposal (sponsors only)
router.post(
  '/sponsorships',
  authenticate,
  authorizeRoles('sponsor'), // Only sponsors can propose
  async (req: Request, res: Response) => {
    try {
      const sponsorId = req.user!.userId;
      const sponsorEmail = req.user!.email;
      const { eventId, proposedBudget, benefits, duration } = req.body;

      // Verify event exists
      const event = await EventModel.findById(eventId);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      // Create sponsorship proposal
      const sponsorship = await SponsorshipModel.create({
        event: eventId,
        sponsor: sponsorId,
        sponsorEmail,
        proposedBudget,
        benefits,
        duration,
        status: 'pending',
      });

      res.status(201).json({
        success: true,
        message: 'Sponsorship proposal created',
        data: sponsorship,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * ═══════════════════════════════════════════════════════════════════
 * PATTERN 8: Organizers Reviewing Sponsorships
 * ═══════════════════════════════════════════════════════════════════
 */

// PUT /api/sponsorships/:id/approve
// Approve sponsorship (event organizer or admin)
router.put(
  '/sponsorships/:id/approve',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const sponsorshipId = req.params.id;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      // Fetch sponsorship
      const sponsorship = await SponsorshipModel.findById(sponsorshipId);
      if (!sponsorship) {
        res.status(404).json({
          success: false,
          message: 'Sponsorship not found',
        });
        return;
      }

      // Verify organizer owns the event (or is admin)
      const event = await EventModel.findById(sponsorship.event);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      if (event.createdBy !== userId && userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You can only approve sponsorships for your events',
        });
        return;
      }

      // Approve sponsorship
      const updated = await SponsorshipModel.findByIdAndUpdate(
        sponsorshipId,
        { status: 'approved', approvedAt: new Date() },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Sponsorship approved',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;

/**
 * ═══════════════════════════════════════════════════════════════════
 * HOW TO USE THIS TEMPLATE
 * ═══════════════════════════════════════════════════════════════════
 */

/*
1. IMPORT AUTHENTICATION & AUTHORIZATION:
   import { authenticate } from '../middlewares/auth.middleware';
   import { authorizeRoles } from '../middlewares/role.middleware';

2. CHOOSE APPROPRIATE PATTERN:
   - Pattern 1: Public routes (no middleware)
   - Pattern 2: Protected routes (authenticate only)
   - Pattern 3: Role-specific access (authenticate + authorizeRoles)
   - Pattern 4: Multiple roles
   - Pattern 5: Admin only
   - Pattern 6: Role-based response data
   - Pattern 7-8: Real-world sponsorship examples

3. ACCESS USER DATA IN HANDLER:
   const userId = req.user!.userId;
   const userEmail = req.user!.email;
   const userRole = req.user!.role;

4. REGISTER ROUTES IN APP.TS:
   import eventRoutes from './routes/event.routes';
   app.use('/api', eventRoutes);

5. TEST WITH CURL:
   curl -X POST http://localhost:5000/api/sponsorships \
     -H "Authorization: Bearer <sponsor_token>" \
     -H "Content-Type: application/json" \
     -d '{ "eventId": "...", "proposedBudget": 50000 }'

✨ Security handled automatically by middleware!
*/
