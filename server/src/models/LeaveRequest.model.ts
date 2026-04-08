import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  department: string; // ✅ Add this line to your interface
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  managerComments?: string;
}

const LeaveRequestSchema: Schema<ILeaveRequest> = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // ✅ ADDED: Stores the employee's department at the time of request
    department: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    days: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    appliedOn: { type: Date, default: Date.now },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    managerComments: { type: String },
  },
  {
    timestamps: true,
    collection: 'leaverequests'
  }
);

LeaveRequestSchema.index({ employeeId: 1, status: 1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);

// ✅ ADD THIS LINE TO FIX THE IMPORT ERROR
export default LeaveRequest;