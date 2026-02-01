import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsorshipProposal extends Document {
  event: mongoose.Types.ObjectId;
  sponsor: mongoose.Types.ObjectId;
  proposedAmount: number;
  proposedBenefits: string[];
  message?: string;
  responseNote?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiation';
  createdAt: Date;
  updatedAt: Date;
}

const SponsorshipProposalSchema = new Schema<ISponsorshipProposal>(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    proposedBenefits: [{
      type: String,
    }],
    message: {
      type: String,
      trim: true,
    },
    responseNote: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'negotiation'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Composite index: one proposal per sponsor per event
SponsorshipProposalSchema.index({ event: 1, sponsor: 1 }, { unique: true });
SponsorshipProposalSchema.index({ status: 1 });
SponsorshipProposalSchema.index({ sponsor: 1 });

export default mongoose.model<ISponsorshipProposal>('SponsorshipProposal', SponsorshipProposalSchema);
