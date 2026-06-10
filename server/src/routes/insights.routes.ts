import express from 'express';
import { chatWithEmployee, getEmployeeInsights } from '../controllers/insights.controller.js';
import { authenticate } from '../middlewares/authenticate.js'; 

const router = express.Router();

router.get('/insights', authenticate, getEmployeeInsights);
router.post('/chat', authenticate, chatWithEmployee);

export default router;