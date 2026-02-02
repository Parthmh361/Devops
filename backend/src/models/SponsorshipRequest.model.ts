import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsorshipRequest extends Document {
    sponsor: mongoose.Types.ObjectId;
    organizer: mongoose.Types.ObjectId;
    event: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    initiatedBy: 'sponsor' | 'organizer';
    message: string;
    createdAt: Date;
    updatedAt: Date;
}

const SponsorshipRequestSchema = new Schema<ISponsorshipRequest>(
    {
        sponsor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
        initiatedBy: {
            type: String,
            enum: ['sponsor', 'organizer'],
            default: 'sponsor',
        },
        message: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Indexes
SponsorshipRequestSchema.index({ sponsor: 1, organizer: 1, event: 1 }, { unique: true });
SponsorshipRequestSchema.index({ organizer: 1, status: 1 });
SponsorshipRequestSchema.index({ sponsor: 1, status: 1 });

export default mongoose.model<ISponsorshipRequest>('SponsorshipRequest', SponsorshipRequestSchema);
