import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'organizer' | 'sponsor' | 'admin';
  phone?: string;
  organizationName?: string;
  designation?: string;
  website?: string;
  bio?: string;
  logo?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User schema definition
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Exclude password from queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['organizer', 'sponsor', 'admin'],
        message: 'Role must be either organizer, sponsor, or admin',
      },
      default: 'organizer',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    organizationName: {
      type: String,
      trim: true,
      maxlength: [200, 'Organization name cannot exceed 200 characters'],
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
    },
    website: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    logo: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete (ret as any).password; // Remove password from JSON output
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete (ret as any).password; // Remove password from object output
        return ret;
      },
    },
  }
);

// Create and export the User model
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
