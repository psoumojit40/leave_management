import { Router } from 'express';
// Added .js extensions to all imports
import {
  markAttendance,
  getAttendanceRecords,
  getAttendanceStats,
  importAttendanceCSV
} from '../controllers/attendance.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { 
  attendanceValidator, 
  dateRangeValidator,
  idValidator 
} from '../validators/attendance.validator.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Employee routes
router.post('/mark', validate(attendanceValidator), markAttendance);
router.get('/', validate(dateRangeValidator), getAttendanceRecords);
router.get('/stats', validate(dateRangeValidator), getAttendanceStats);

// Example usage of idValidator if you have a single record route
// router.get('/:id', validate(idValidator), getAttendanceById);

// Manager/Admin routes
router.post('/import', authorize(['manager', 'admin']), importAttendanceCSV);

export default router;