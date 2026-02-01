import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import fs from 'fs';
import path from 'path';
import Document from '../models/Document.model';
import Collaboration from '../models/Collaboration.model';

// Valid file MIME types
const VALID_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// File extension mapping
const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

/**
 * POST /api/documents/:collaborationId
 * Upload a document to a collaboration
 * Uses multer middleware to handle file upload
 * Body form-data: file (binary), documentType (string: agreement|invoice|deck|other)
 */
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collaborationId } = req.params;
    const userId = (req as any).userId;
    const { documentType } = req.body;
    const file = (req as any).file;

    // Validate collaboration ID
    if (!isValidObjectId(collaborationId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid collaboration ID',
      });
      return;
    }

    // Check if file was uploaded
    if (!file) {
      res.status(400).json({
        success: false,
        message: 'No file provided',
      });
      return;
    }

    // Validate MIME type
    if (!VALID_MIME_TYPES.includes(file.mimetype)) {
      // Delete uploaded file if invalid
      fs.unlinkSync(file.path);
      res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${VALID_MIME_TYPES.join(', ')}`,
      });
      return;
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      fs.unlinkSync(file.path);
      res.status(400).json({
        success: false,
        message: 'File size exceeds maximum limit of 10MB',
      });
      return;
    }

    // Validate document type
    const validDocTypes = ['agreement', 'invoice', 'deck', 'other'];
    const docType = documentType || 'other';
    if (!validDocTypes.includes(docType)) {
      fs.unlinkSync(file.path);
      res.status(400).json({
        success: false,
        message: `Invalid document type. Allowed types: ${validDocTypes.join(', ')}`,
      });
      return;
    }

    // Check if collaboration exists and user is participant
    const collaboration = await Collaboration.findById(collaborationId);

    if (!collaboration) {
      fs.unlinkSync(file.path);
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
      fs.unlinkSync(file.path);
      res.status(403).json({
        success: false,
        message: 'You do not have access to this collaboration',
      });
      return;
    }

    // Create relative file path for storage
    const fileExtension = MIME_TO_EXT[file.mimetype] || 'bin';
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
    const relativeFilePath = path.join('documents', collaborationId.toString(), filename);
    const absoluteFilePath = path.join(process.cwd(), 'uploads', relativeFilePath);

    // Ensure directory exists
    const directory = path.dirname(absoluteFilePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Move file from temp location to target location
    fs.renameSync(file.path, absoluteFilePath);

    // Create document record in database
    const document = new Document({
      collaboration: collaborationId,
      uploadedBy: userId,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      filePath: relativeFilePath,
      documentType: docType,
    });

    await document.save();
    await document.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    });
  } catch (error: any) {
    // Clean up uploaded file on error
    if ((req as any).file) {
      try {
        fs.unlinkSync((req as any).file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/documents/:collaborationId
 * Get all documents in a collaboration
 * Query: page=1, limit=20 (optional)
 */
export const getDocuments = async (req: Request, res: Response): Promise<void> => {
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

    // Get documents with pagination
    const [documents, total] = await Promise.all([
      Document.find({ collaboration: collaborationId })
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Document.countDocuments({ collaboration: collaborationId }),
    ]);

    res.status(200).json({
      success: true,
      data: documents,
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
 * GET /api/documents/download/:id
 * Download a document file
 */
export const downloadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Validate document ID
    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid document ID',
      });
      return;
    }

    // Find document
    const document = await Document.findById(id);

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found',
      });
      return;
    }

    // Check if collaboration exists and user is participant
    const collaboration = await Collaboration.findById(document.collaboration);

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
        message: 'You do not have access to this document',
      });
      return;
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', document.filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
      return;
    }

    // Send file
    res.download(filePath, document.fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/documents/:id
 * Delete a document (by uploader or organizer or admin)
 */
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Validate document ID
    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid document ID',
      });
      return;
    }

    // Find document
    const document = await Document.findById(id);

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found',
      });
      return;
    }

    // Check if collaboration exists
    const collaboration = await Collaboration.findById(document.collaboration);

    if (!collaboration) {
      res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
      return;
    }

    // Verify user is document uploader or organizer
    const canDelete =
      document.uploadedBy.toString() === userId ||
      collaboration.organizer.toString() === userId;

    if (!canDelete) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this document',
      });
      return;
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'uploads', document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete document from database
    await Document.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
