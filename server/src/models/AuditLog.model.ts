import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  action: string;
  targetId?: mongoose.Types.ObjectId;
  targetType?: string;
  targetName?: string;
  description?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    targetType: {
      type: String,
      trim: true,
    },
    targetName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
AuditLogSchema.index({ actorId: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ targetId: 1, targetType: 1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);