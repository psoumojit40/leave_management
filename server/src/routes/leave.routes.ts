import { Router } from 'express';
import {
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest, // This will be our "Apply Leave" function
  updateLeaveRequest,
  deleteLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveBalances,
  getLeaveStats
} from '../controllers/leave.controller.js';

import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';

import { 
  createLeaveValidator, 
  updateLeaveValidator, 
  idValidator 
} from '../validators/leave.validator.js';

const router = Router();

// --- AUTH PROTECTION ---
// This ensures only logged-in users can touch any of these routes
router.use(authenticate);

// --- EMPLOYEE ROUTES ---

// 1. Get my own leave history
router.get('/', getLeaveRequests);

// 2. Get my current balances (Annual, Sick, etc.)
router.get('/balances', getLeaveBalances);

// 3. Get quick dashboard stats
router.get('/stats', getLeaveStats);

// 4. APPLY FOR LEAVE (The "brain" we are building)
router.post('/', validate(createLeaveValidator), createLeaveRequest);

// 5. Get details of a specific request
router.get('/:id', validate(idValidator), getLeaveRequestById);

// 6. Edit a pending request (e.g., change dates)
router.put('/:id', validate(updateLeaveValidator), updateLeaveRequest);

// 7. Cancel a pending request
router.delete('/:id', validate(idValidator), deleteLeaveRequest);


// --- MANAGER & ADMIN ROUTES ---

// 8. APPROVE: This will also trigger...
router.put('/:id/approve', authorize('manager', 'admin'), approveLeaveRequest);

// 9. REJECT: Simply marks as rejected
router.put('/:id/reject', authorize('manager', 'admin'), rejectLeaveRequest);

export default router;