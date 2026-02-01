import mongoose, { Document, Schema } from 'mongoose';
import { ICollaboration } from './Collaboration.model';
import { IUser } from './User.model';

export interface IMessage extends Document {
  collaboration: ICollaboration['_id'];
  sender: IUser['_id'];
  content: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
  }>;
  isRead: boolean;
  createdAt: Date;
}

const messageSchema: Schema<IMessage> = new Schema(
  {
    collaboration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collaboration',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 5000,
    },
    attachments: {
      type: [
        {
          fileName: String,
          fileUrl: String,
          fileType: String,
        },
      ],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
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
 * - collaboration: For quick lookup of all messages in a collaboration
 * - createdAt: For sorting and range queries
 * - Compound index: (collaboration, createdAt) for efficient message retrieval
 */
messageSchema.index({ collaboration: 1, createdAt: 1 });

export default mongoose.model<IMessage>('Message', messageSchema);
