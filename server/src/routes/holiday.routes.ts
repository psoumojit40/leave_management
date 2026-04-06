import { Router } from 'express';
// Added .js extensions and fixed createHoliday typo
import {
  getHolidays,
  getHolidayById,
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

// Apply authentication middleware to all routes
router.use(authenticate);

// Employee routes (read-only)
router.get('/', getHolidays);
router.get('/:id', validate(idValidator), getHolidayById);

// Manager/Admin routes
router.post('/', authorize(['manager', 'admin']), validate(createHolidayValidator), createHoliday);
router.put('/:id', authorize(['manager', 'admin']), validate(updateHolidayValidator), updateHoliday);
router.delete('/:id', authorize(['manager', 'admin']), validate(idValidator), deleteHoliday);

export default router;