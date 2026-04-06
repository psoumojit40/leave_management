import { Router } from 'express';

// ✅ Added .js extensions for ESM compatibility
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  forgotPassword, 
  resetPassword 
} from '../controllers/auth.controller.js'; 

import { validate } from '../middlewares/validate.js';

// ✅ Imported all 4 validators
import { 
  registerValidator, 
  loginValidator, 
  forgotPasswordValidator, 
  resetPasswordValidator 
} from '../validators/auth.validator.js';

const router = Router();

// 1. Register with Validation
router.post('/register', validate(registerValidator), register);

// 2. Login with Validation
router.post('/login', validate(loginValidator), login);

// 3. Simple Logout
router.post('/logout', logout);

// 4. Token Refresh
router.post('/refresh-token', refreshToken);

// 5. Forgot Password with Validation
router.post('/forgot-password', validate(forgotPasswordValidator), forgotPassword);

// 6. Reset Password with Validation
router.post('/reset-password', validate(resetPasswordValidator), resetPassword);

export default router;