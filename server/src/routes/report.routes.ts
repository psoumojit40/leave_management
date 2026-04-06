import { Router } from 'express';
import {
  generatePayrollReport,
  generateAttendanceReport,
  generateLeaveReport
} from '../controllers/report.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { dateRangeValidator } from '../validators/report.validator';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Only managers and admins can access reports
router.use(authorize(['manager', 'admin']));

router.get('/payroll', validate(dateRangeValidator), generatePayrollReport);
router.get('/attendance', validate(dateRangeValidator), generateAttendanceReport);
router.get('/leave', validate(dateRangeValidator), generateLeaveReport);

export default router;