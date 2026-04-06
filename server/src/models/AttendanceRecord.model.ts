import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceRecord extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'half-day';
  hoursWorked: number;
  checkInTime?: Date;
  checkOutTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema: Schema<IAttendanceRecord> = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day'],
      required: true,
    },
    hoursWorked: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for employeeId and date
AttendanceRecordSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const AttendanceRecord = mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);