import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Message from '../models/Message.model';
import Collaboration from '../models/Collaboration.model';

/**
 * GET /api/messages/:collaborationId
 * Get all messages in a collaboration with pagination
 * Query: page=1, limit=20 (optional)
 * Returns: Array of messages sorted by createdAt ascending
 */
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collaborationId } = req.params;
    const userId = (req as any).userId;
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(100, parseInt((req.query.limit as string) || '20'));
    const skip = (page - 1) * limit;

    // Validate collaboration ID
    if (!isValidObjectId(collaborationId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid collaboration ID',
      });
      return;
    }

    // Check if collaboration exists and user is participant
    const collaboration = await Collaboration.findById(collaborationId);

    if (!collaboration) {
      res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
      return;
    }

    // Verify user is participant (organizer or sponsor only)
    const isParticipant =
      collaboration.organizer.toString() === userId ||
      collaboration.sponsor.toString() === userId;

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this collaboration',
      });
      return;
    }

    // Get messages with pagination
    const [messages, total] = await Promise.all([
      Message.find({ collaboration: collaborationId })
        .populate('sender', 'name email')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ collaboration: collaborationId }),
    ]);

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/messages/:collaborationId
 * Create a new message in a collaboration
 * Body: { content: string, attachments?: array }
 */
export const createMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collaborationId } = req.params;
    const userId = (req as any).userId;
    const { content, attachments } = req.body;

    // Validate collaboration ID
    if (!isValidObjectId(collaborationId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid collaboration ID',
      });
      return;
    }

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Message content is required and must be non-empty',
      });
      return;
    }

    if (content.length > 5000) {
      res.status(400).json({
        success: false,
        message: 'Message content cannot exceed 5000 characters',
      });
      return;
    }

    // Check if collaboration exists and user is participant
    const collaboration = await Collaboration.findById(collaborationId);

    if (!collaboration) {
      res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
      return;
    }

    // Verify user is participant (organizer or sponsor only)
    const isParticipant =
      collaboration.organizer.toString() === userId ||
      collaboration.sponsor.toString() === userId;

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this collaboration',
      });
      return;
    }

    // Create message
    const message = new Message({
      collaboration: collaborationId,
      sender: userId,
      content: content.trim(),
      attachments: attachments || [],
      isRead: false,
    });

    await message.save();
    await message.populate('sender', 'name email');

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/messages/:id/read
 * Mark a message as read
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Validate message ID
    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid message ID',
      });
      return;
    }

    // Find message
    const message = await Message.findById(id);

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found',
      });
      return;
    }

    // Check if user is participant of the collaboration
    const collaboration = await Collaboration.findById(message.collaboration);

    if (!collaboration) {
      res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
      return;
    }

    const isParticipant =
      collaboration.organizer.toString() === userId ||
      collaboration.sponsor.toString() === userId;

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this message',
      });
      return;
    }

    // Mark as read
    message.isRead = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/messages/:collaborationId/unread-count
 * Get count of unread messages in a collaboration
 */
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collaborationId } = req.params;
    const userId = (req as any).userId;

    // Validate collaboration ID
    if (!isValidObjectId(collaborationId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid collaboration ID',
      });
      return;
    }

    // Check if collaboration exists and user is participant
    const collaboration = await Collaboration.findById(collaborationId);

    if (!collaboration) {
      res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
      return;
    }

    const isParticipant =
      collaboration.organizer.toString() === userId ||
      collaboration.sponsor.toString() === userId;

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this collaboration',
      });
      return;
    }

    // Count unread messages
    const unreadCount = await Message.countDocuments({
      collaboration: collaborationId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
