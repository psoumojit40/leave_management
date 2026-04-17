import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS
import path from 'node:path';


import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import corsOptions from './config/corsOptions.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { auditLogger } from './middlewares/auditLogger';

// Import routes
import authRoutes from './routes/auth.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import userRoutes from './routes/user.routes.js';
import holidayRoutes from './routes/holiday.routes.js';
import reportRoutes from './routes/report.routes.js';
import teamRoutes from './routes/team.routes.js';
import leaveSettingRoutes from './routes/leaveSetting.routes.js';


// Import cron jobs
import { initializeCronJobs } from './jobs/cronRunner.js';

// ✅ IMPORT THE MODEL FOR AUTO-SEEDING
import { LeaveSetting } from './models/LeaveSetting.model.js';

const app = express();

// Connect to MongoDB
connectDB();

const autoSeedLeaveSettings = async () => {
  try {
    const count = await LeaveSetting.countDocuments();
    if (count === 0) {
      const defaultSettings = [
        { name: 'Annual Leave', defaultDays: 24, color: 'bg-blue-500' },
        { name: 'Sick Leave', defaultDays: 10, color: 'bg-red-500' },
        { name: 'Personal Leave', defaultDays: 10, color: 'bg-amber-500' },
        { name: 'Bereavement', defaultDays: 5, color: 'bg-gray-600' },
        { name: 'Maternity Leave', defaultDays: 182, color: 'bg-pink-500' },
        { name: 'Paternity Leave', defaultDays: 14, color: 'bg-cyan-500' },
        { name: 'Special Leave', defaultDays: 5, color: 'bg-purple-500' }
      ];
      await LeaveSetting.insertMany(defaultSettings);
      console.log('✅ Default Leave Settings automatically seeded!');
    }
  } catch (error) {
    console.error('❌ Error auto-seeding leave settings:', error);
  }
};

// ✅ CALL THE SEED FUNCTION
autoSeedLeaveSettings();




// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Audit logger middleware
app.use(auditLogger);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/leave-settings', leaveSettingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Leave Management System API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start cron jobs
if (process.env.NODE_ENV !== 'test') {
  initializeCronJobs();
}

export default app;

