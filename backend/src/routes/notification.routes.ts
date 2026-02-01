import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
} from '../controllers/notification.controller';

const router: Router = express.Router();

/**
 * AUTHENTICATED ROUTES
 */
// Get notifications
router.get('/', authenticate, getNotifications);

// Get unread count
router.get('/unread-count', authenticate, getUnreadCount);

// Mark notification as read
router.put('/:id/read', authenticate, markAsRead);

// Mark all notifications as read
router.put('/read-all', authenticate, markAllAsRead);

// Delete notification
router.delete('/:id', authenticate, deleteNotification);

export default router;
