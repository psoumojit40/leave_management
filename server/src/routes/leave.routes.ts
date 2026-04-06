import { Router } from 'express';
import {
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveBalances,
  getLeaveStats
} from '../controllers/leave.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { 
  createLeaveValidator, 
  updateLeaveValidator, 
  idValidator 
} from '../validators/leave.validator';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Employee routes
router.get('/', getLeaveRequests);
router.get('/balances', getLeaveBalances);
router.get('/stats', getLeaveStats);
router.post('/', validate(createLeaveValidator), createLeaveRequest);
router.get('/:id', validate(idValidator), getLeaveRequestById);
router.put('/:id', validate(updateLeaveValidator), updateLeaveRequest);
router.delete('/:id', validate(idValidator), deleteLeaveRequest);

// Manager/Admin routes for approvals
router.put('/:id/approve', authorize(['manager', 'admin']), approveLeaveRequest);
router.put('/:id/reject', authorize(['manager', 'admin']), rejectLeaveRequest);

export default router;