import mongoose from 'mongoose';
import { User } from '../models/User.model.js'; // ✅ Ensure this path is correct

// Internal function to seed the hardcoded admin
const initAdmin = async () => {
  try {
    // Check if any admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const admin = new User({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@system.com',
        password: '123456', // Model middleware will hash this automatically
        role: 'admin',
        gender: 'male',
        adminId: 'ADMIN',
        department: 'Management',
        isActive: true
      });

      await admin.save();
      console.log('🚀 SYSTEM STARTUP: Admin Created (ADMIN / 123456)');
    } else {
      console.log('✅ SYSTEM STARTUP: Admin account verified.');
    }
  } catch (error) {
    console.error('❌ Admin initialization failed:', error);
  }
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 
      'mongodb+srv://psoumojit40:u02L9DUo8Veo7SrY@cluster0.c904dui.mongodb.net/leave_management'
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // ✅ Run the admin check as soon as we are connected
    await initAdmin();

  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unexpected error occurred while connecting to MongoDB:', error);
    }
    process.exit(1);
  }
};

export default connectDB;