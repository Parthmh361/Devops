import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'system' | 'proposal' | 'collaboration';
  isRead: boolean;
  relatedEntity?: {
    type: 'event' | 'proposal' | 'collaboration';
    id: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['system', 'proposal', 'collaboration'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedEntity: {
      type: {
        type: String,
        enum: ['event', 'proposal', 'collaboration'],
      },
      id: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

// Indices for common queries
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

export default mongoose.model<INotification>('Notification', NotificationSchema);
