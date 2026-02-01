import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getMessages,
  createMessage,
  markAsRead,
  getUnreadCount,
} from '../controllers/message.controller';

const router: Router = express.Router();

/**
 * Message Routes
 * All routes require authentication
 * SPECIFIC routes must come BEFORE generic :collaborationId routes
 */

// Get unread count for a collaboration - MUST come before generic /:collaborationId
router.get('/:collaborationId/unread-count', authenticate, getUnreadCount);

// Mark a message as read
router.patch('/:id/read', authenticate, markAsRead);

// Get all messages in a collaboration with pagination - Query params: page, limit
router.get('/:collaborationId', authenticate, getMessages);

// Create a new message in a collaboration
router.post('/:collaborationId', authenticate, createMessage);

export default router;
