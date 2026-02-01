import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  category?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  eventMode: 'online' | 'offline' | 'hybrid';
  sponsorshipNeeds: {
    amountRequired: number;
    categories: string[];
    benefits: string[];
  };
  organizer: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'closed';
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(this: IEvent, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    location: {
      type: String,
      trim: true,
    },
    eventMode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'offline',
    },
    sponsorshipNeeds: {
      amountRequired: {
        type: Number,
        default: 0,
      },
      categories: [{
        type: String,
      }],
      benefits: [{
        type: String,
      }],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for searching events
EventSchema.index({ title: 'text', description: 'text' });
EventSchema.index({ organizer: 1 });
EventSchema.index({ status: 1, isApproved: 1 });

export default mongoose.model<IEvent>('Event', EventSchema);
