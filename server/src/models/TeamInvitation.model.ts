import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamInvitation extends Document {
  sender: mongoose.Types.ObjectId;    // The Manager
  recipient: mongoose.Types.ObjectId; // The Employee
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

const TeamInvitationSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
}, { 
  timestamps: true,
  collection: 'teaminvitations' // ✅ THIS FORCES IT TO USE THIS EXACT NAME
});

// Prevent duplicate pending invitations between the same two people
TeamInvitationSchema.index({ sender: 1, recipient: 1, status: 1 }, { unique: true });

export const TeamInvitation = mongoose.model<ITeamInvitation>('TeamInvitation', TeamInvitationSchema);