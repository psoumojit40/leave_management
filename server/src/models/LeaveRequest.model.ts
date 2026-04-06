import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  days: number; 
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: Date; // FIX 1: Added to interface so TS recognizes it
  approvedBy?: mongoose.Types.ObjectId;
  approvedOn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema: Schema<ILeaveRequest> = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'vacation', 'sick', 'personal', 'bereavement', 
        'maternity', 'paternity', 'jury', 'military',
      ],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    days: {
      type: Number, // FIX 2: Added to Schema so it actually saves to DB
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    appliedOn: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedOn: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
LeaveRequestSchema.index({ employeeId: 1, status: 1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });
LeaveRequestSchema.index({ appliedOn: 1 });

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);