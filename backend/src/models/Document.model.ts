import mongoose, { Document, Schema } from 'mongoose';
import { ICollaboration } from './Collaboration.model';
import { IUser } from './User.model';

export interface IDocument extends Document {
  collaboration: ICollaboration['_id'];
  uploadedBy: IUser['_id'];
  fileName: string;
  fileType: string;
  fileSize: number; // in bytes
  filePath: string; // relative path from uploads directory
  documentType: 'agreement' | 'invoice' | 'deck' | 'other';
  createdAt: Date;
}

const documentSchema: Schema<IDocument> = new Schema(
  {
    collaboration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collaboration',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    filePath: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      enum: ['agreement', 'invoice', 'deck', 'other'],
      default: 'other',
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

/**
 * Indexes
 * - collaboration: For quick lookup of all documents in a collaboration
 * - createdAt: For sorting documents by upload date
 * - Compound index: (collaboration, createdAt) for efficient retrieval
 */
documentSchema.index({ collaboration: 1, createdAt: 1 });

export default mongoose.model<IDocument>('Document', documentSchema);
