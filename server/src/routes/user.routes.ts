import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser
} from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { 
  createUserValidator, 
  updateUserValidator, 
  idValidator 
} from '../validators/user.validator';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Employee routes (limited access)
router.get('/me', getCurrentUser);

// Manager/Admin routes
router.get('/', authorize(['manager', 'admin']), getUsers);
router.get('/:id', authorize(['manager', 'admin']), validate(idValidator), getUserById);
router.post('/', authorize(['admin']), validate(createUserValidator), createUser);
router.put('/:id', authorize(['admin']), validate(updateUserValidator), updateUser);
router.delete('/:id', authorize(['admin']), validate(idValidator), deleteUser);

export default router;