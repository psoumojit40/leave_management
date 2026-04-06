import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs'; 

export interface IUser extends Document {
  firstName: string;   // Added
  lastName: string;    // Added
  email: string;
  password: string;
  role: 'employee' | 'manager' | 'admin';
  // Specific IDs for your requirements
  employeeId?: string; // EMP_101
  managerId?: string;  // MANGR_101
  adminId?: string;    // ADMIN
  dob?: Date;          // Added for Employee
  joiningDate: Date;
  department?: string;
  isActive: boolean;
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
    dob: { type: Date },
    joiningDate: { type: Date, default: Date.now },
    department: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Keep your existing bcrypt logic below...
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);