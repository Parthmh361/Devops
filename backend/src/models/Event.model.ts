import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  category?: string;
  startDate: Date;
  endDate: Date;
  date: Date; // Specific event date
  amountRequired: number; // Total sponsorship amount required
  location?: string;
  eventMode: 'online' | 'offline' | 'hybrid';
  sponsorshipNeeds: {
    tiers: Array<{
      name: string;
      amount: number;
      benefits: string[];
    }>;
    categories: string[];
    customBenefits: string[];
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
        validator: function (this: IEvent, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amountRequired: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
      tiers: [
        {
          name: {
            type: String,
            trim: true,
          },
          amount: {
            type: Number,
            min: 0,
            default: 0,
          },
          benefits: [
            {
              type: String,
              trim: true,
            },
          ],
        },
      ],
      categories: [
        {
          type: String,
          trim: true,
        },
      ],
      customBenefits: [
        {
          type: String,
          trim: true,
        },
      ],
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
