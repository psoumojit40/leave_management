import mongoose, { Schema, Document } from 'mongoose';

export interface IHoliday extends Document {
  name: string;
  date: Date;
  type: 'Public' | 'Company' | 'Observance';
  duration: number;
}

const HolidaySchema: Schema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true, unique: true }, // No two holidays on same day
  duration: { type: Number, required: true, default: 1 },
  type: { type: String, enum: ['Public', 'Company', 'Observance'], default: 'Public' }
}, { timestamps: true });

export const Holiday = mongoose.model<IHoliday>('Holiday', HolidaySchema);