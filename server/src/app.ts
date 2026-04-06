import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS


import express from 'express';
import cors from 'cors';
// import { config } from './config/env';
import connectDB from './config/db';
import corsOptions from './config/corsOptions';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { auditLogger } from './middlewares/auditLogger';

// Import routes
import authRoutes from './routes/auth.routes';
import leaveRoutes from './routes/leave.routes';
import attendanceRoutes from './routes/attendance.routes';
import userRoutes from './routes/user.routes';
import holidayRoutes from './routes/holiday.routes';
import reportRoutes from './routes/report.routes';

// Import cron jobs
import { initializeCronJobs } from './jobs/cronRunner';

const app = express();

// Connect to MongoDB
connectDB();

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
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));

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