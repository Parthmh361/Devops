import { Request, Response } from 'express';
import User from '../models/User.model';
import Event from '../models/Event.model';
import SponsorshipProposal from '../models/SponsorshipProposal.model';
import Collaboration from '../models/Collaboration.model';

/**
 * GET /api/admin/analytics/overview
 * Get platform overview statistics
 * Auth: Admin only
 */
export const getOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Execute all aggregations in parallel for better performance
    const [
      userStats,
      eventStats,
      proposalStats,
      collaborationStats,
    ] = await Promise.all([
      // User statistics by role
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
            },
            verified: {
              $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] },
            },
          },
        },
      ]),

      // Event statistics by status
      Event.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] },
            },
          },
        },
      ]),

      // Proposal statistics by status
      SponsorshipProposal.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Collaboration statistics by status
      Collaboration.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format user statistics
    const users = {
      total: 0,
      byRole: {} as Record<string, any>,
    };
    userStats.forEach((stat) => {
      users.total += stat.count;
      users.byRole[stat._id] = {
        total: stat.count,
        active: stat.active,
        verified: stat.verified,
      };
    });

    // Format event statistics
    const events = {
      total: 0,
      byStatus: {} as Record<string, any>,
      totalApproved: 0,
    };
    eventStats.forEach((stat) => {
      events.total += stat.count;
      events.byStatus[stat._id] = {
        total: stat.count,
        approved: stat.approved,
      };
      events.totalApproved += stat.approved;
    });

    // Format proposal statistics
    const proposals = {
      total: 0,
      byStatus: {} as Record<string, number>,
    };
    proposalStats.forEach((stat) => {
      proposals.total += stat.count;
      proposals.byStatus[stat._id] = stat.count;
    });

    // Format collaboration statistics
    const collaborations = {
      total: 0,
      byStatus: {} as Record<string, number>,
    };
    collaborationStats.forEach((stat) => {
      collaborations.total += stat.count;
      collaborations.byStatus[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        events,
        proposals,
        collaborations,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Get overview error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics overview',
    });
  }
};

/**
 * GET /api/admin/analytics/trends
 * Get platform growth trends (last 6 months)
 * Auth: Admin only
 */
export const getTrends = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Calculate date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Execute trend aggregations in parallel
    const [newUsersPerMonth, newEventsPerMonth] = await Promise.all([
      // New users per month
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
            organizers: {
              $sum: { $cond: [{ $eq: ['$role', 'organizer'] }, 1, 0] },
            },
            sponsors: {
              $sum: { $cond: [{ $eq: ['$role', 'sponsor'] }, 1, 0] },
            },
            admins: {
              $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] },
            },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]),

      // New events per month
      Event.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
            draft: {
              $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] },
            },
            published: {
              $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
            },
            approved: {
              $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] },
            },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]),
    ]);

    // Format month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    // Format user trends
    const userTrends = newUsersPerMonth.map((item) => ({
      period: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      year: item._id.year,
      month: item._id.month,
      total: item.count,
      organizers: item.organizers,
      sponsors: item.sponsors,
      admins: item.admins,
    }));

    // Format event trends
    const eventTrends = newEventsPerMonth.map((item) => ({
      period: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      year: item._id.year,
      month: item._id.month,
      total: item.count,
      draft: item.draft,
      published: item.published,
      approved: item.approved,
    }));

    res.status(200).json({
      success: true,
      data: {
        period: {
          from: sixMonthsAgo.toISOString(),
          to: new Date().toISOString(),
        },
        userTrends,
        eventTrends,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Get trends error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics trends',
    });
  }
};
