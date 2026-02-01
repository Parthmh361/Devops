import express, { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middlewares/auth.middleware';
import {
  uploadDocument,
  getDocuments,
  downloadDocument,
  deleteDocument,
} from '../controllers/document.controller';

const router: Router = express.Router();

/**
 * Multer Configuration
 * Stores files in uploads/documents with timestamp and random suffix
 */
const storage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // Files are moved to final location in controller
    void req; void file; // Suppress unused warnings
    cb(null, path.join(process.cwd(), 'uploads', 'temp'));
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Original filename is preserved, moved in controller with unique suffix
    void req; // Suppress unused warning
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const filename = `${uniqueSuffix}-${file.originalname}`;
    cb(null, filename);
  },
});

/**
 * File Filter
 * Validates file types before upload
 */
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  void req; // Suppress unused warning
  // Allowed MIME types
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`));
  }
};

/**
 * Multer Upload Configuration
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

/**
 * Document Routes
 * All routes require authentication
 * SPECIFIC routes must come BEFORE generic :collaborationId routes
 */

// Download a document file - MUST come before generic /:collaborationId
router.get('/download/:id', authenticate, downloadDocument);

// Delete a document
router.delete('/:id', authenticate, deleteDocument);

// Upload a document to a collaboration
// Form-data: file (binary), documentType (optional: agreement|invoice|deck|other)
router.post('/:collaborationId', authenticate, upload.single('file'), uploadDocument);

// Get all documents in a collaboration with pagination - Query params: page, limit
router.get('/:collaborationId', authenticate, getDocuments);

export default router;
