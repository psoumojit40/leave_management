import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'employee' | 'manager' | 'admin';
  employeeId?: string;
  managerId?: string;
  adminId?: string;
  assignedManager?: mongoose.Types.ObjectId;
  dob?: Date;
  joiningDate: Date;
  department?: string;
  isActive: boolean;
  gender: 'male' | 'female' | 'other';

  // ✅ UPDATED: Changed to a Map so keys can be dynamic strings
  leaveBalances: Map<string, number>;

  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['employee', 'manager', 'admin'],
      default: 'employee'
    },
    employeeId: { type: String, sparse: true },
    managerId: { type: String, sparse: true },
    adminId: { type: String, sparse: true },
    assignedManager: { type: Schema.Types.ObjectId, ref: 'User' },
    dob: { type: Date },
    joiningDate: { type: Date, default: Date.now },
    department: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    leaveBalances: {
      type: Map,
      of: Number,
      default: {}
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
  },
  { timestamps: true }
);

// Password Hashing Middleware
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password Verification Method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);