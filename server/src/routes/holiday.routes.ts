import { Router } from 'express';

// Standardized extensions to .js for ES Module compatibility
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
} from '../controllers/holiday.controller.js'; 
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { 
  createHolidayValidator, 
  updateHolidayValidator, 
  idValidator 
} from '../validators/holiday.validator.js';

const router = Router();

// 1. All users must be logged in
router.use(authenticate);

// 2. Public View: Employees, Managers, and Admins can see holidays
router.get('/', getHolidays);
router.post('/', authorize('manager', 'admin'), createHoliday);

// 3. Management: ONLY Managers and Admins can Create, Update, or Delete
// This ensures that an 'employee' role cannot hit these endpoints
router.post(
  '/', 
  authorize('manager', 'admin'), 
  validate(createHolidayValidator), 
  createHoliday
);

router.put(
  '/:id', 
  authorize('manager', 'admin'), 
  validate(updateHolidayValidator), 
  updateHoliday
);

router.delete(
  '/:id', 
  authorize('manager', 'admin'), 
  validate(idValidator), 
  deleteHoliday
);

export default router;