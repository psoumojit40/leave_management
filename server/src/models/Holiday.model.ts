import mongoose, { Schema, Document } from 'mongoose';

export interface IHoliday extends Document {
  name: string;
  date: Date;
  type: 'public' | 'company' | 'observance';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema: Schema<IHoliday> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['public', 'company', 'observance'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by date
HolidaySchema.index({ date: 1 });

export const Holiday = mongoose.model<IHoliday>('Holiday', HolidaySchema);