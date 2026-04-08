import { Router } from 'express';
// ✅ FIXED: Updated imports to match the new controller functions
import {
  getTodayStatus,
  checkIn,
  checkOut,
  getAttendanceRecords,
  getAttendanceStats,
  getRecentAttendance,
  importAttendanceCSV,
  resetTodayAttendance
} from '../controllers/attendance.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { 
  attendanceValidator, 
  dateRangeValidator
} from '../validators/attendance.validator.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// --- Employee Attendance Flow ---

// 1. Get current status (Checks if user is already checked in today)
router.get('/today', getTodayStatus);

// 2. Start the day (Check-In)
// We apply the attendanceValidator here to ensure the status is valid
router.post('/check-in', validate(attendanceValidator), checkIn);

// 3. End the day (Check-Out)
router.put('/check-out', checkOut);

// 4. View personal history and stats
router.get('/recent', getRecentAttendance);
router.get('/', validate(dateRangeValidator), getAttendanceRecords);
router.get('/stats', validate(dateRangeValidator), getAttendanceStats);


// --- Manager/Admin routes ---
router.post('/import', authorize('manager', 'admin'), importAttendanceCSV);

export default router;

router.delete('/reset-testing', resetTodayAttendance);