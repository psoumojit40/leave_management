import mongoose, { Schema, Document } from 'mongoose';

// 1. TypeScript Interface
export interface ILeaveSetting extends Document {
  name: string;         // e.g., "Annual Leave"
  defaultDays: number;  // e.g., 24
  color: string;        // e.g., "bg-blue-500" (Matches your Tailwind classes)
  isActive: boolean;    // Allows you to "hide" a policy without deleting it
}

// 2. Mongoose Schema
const LeaveSettingSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  defaultDays: { 
    type: Number, 
    required: true,
    min: 0
  },
  color: { 
    type: String, 
    default: 'bg-indigo-500' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

export const LeaveSetting = mongoose.model<ILeaveSetting>('LeaveSetting', LeaveSettingSchema);