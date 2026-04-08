import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/me', getCurrentUser);

// --- TEAM MANAGEMENT ROUTES ---

// --- GENERAL ADMIN/MANAGER ROUTES ---
router.get('/', authorize('manager', 'admin'), getUsers);
router.get('/:id', authorize('manager', 'admin'), getUserById);
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;