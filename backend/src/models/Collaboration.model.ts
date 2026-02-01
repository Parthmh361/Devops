import mongoose, { Schema, Document } from 'mongoose';

export interface ICollaboration extends Document {
  event: mongoose.Types.ObjectId;
  organizer: mongoose.Types.ObjectId;
  sponsor: mongoose.Types.ObjectId;
  proposal: mongoose.Types.ObjectId;
  status: 'active' | 'completed' | 'terminated';
  startDate: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollaborationSchema = new Schema<ICollaboration>(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SponsorshipProposal',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'terminated'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indices for common queries
CollaborationSchema.index({ event: 1 });
CollaborationSchema.index({ organizer: 1 });
CollaborationSchema.index({ sponsor: 1 });
CollaborationSchema.index({ status: 1 });
CollaborationSchema.index({ proposal: 1 }, { unique: true });

export default mongoose.model<ICollaboration>('Collaboration', CollaborationSchema);
