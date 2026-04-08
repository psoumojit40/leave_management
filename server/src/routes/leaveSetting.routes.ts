import express from 'express';
// ✅ One clean import line for both security functions!
import { authenticate } from '../middlewares/authenticate.js'; 
import { authorize } from '../middlewares/authorize.js';

import { 
  getLeaveSettings, 
  createLeaveSetting, 
  updateLeaveQuotas, 
  seedDefaultSettings,
  deleteLeaveSetting // ✅ Added this import
} from '../controllers/leaveSetting.controller.js';

const router = express.Router();

router.get('/', authenticate, getLeaveSettings);
router.get('/seed', seedDefaultSettings);
router.post('/', authenticate, authorize('manager', 'admin'), createLeaveSetting);
router.put('/bulk-update', authenticate, authorize('manager', 'admin'), updateLeaveQuotas);
router.delete('/:id', authenticate, authorize('manager', 'admin'), deleteLeaveSetting);

export default router;