import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceRecord extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date; // Normalized to midnight for the unique index
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
      // We will store only the YYYY-MM-DD part (normalized to midnight) 
      // to ensure the unique index works per day.
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day'],
      default: 'present',
    },
    hoursWorked: {
      type: Number,
      default: 0, // ✅ Changed from required: true to default: 0
      min: 0,
      max: 24,
    },
    checkInTime: {
      type: Date,
      default: Date.now, // Automatically set when record is created
    },
    checkOutTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ COMPOUND INDEX: This is critical. 
// It prevents an employee from having more than one record for the same calendar day.
AttendanceRecordSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const AttendanceRecord = mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);