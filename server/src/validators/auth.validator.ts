import { z } from 'zod';

// 1. REGISTER VALIDATOR
// server/src/validators/auth.validator.ts

export const registerValidator = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name is too short').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['employee', 'manager', 'admin']).default('employee'),
    department: z.string().min(1, 'Please select a department'), // ✅ ADD THIS
    
    employeeId: z.string().optional().or(z.literal('')),
    managerId: z.string().optional().or(z.literal('')),
    dob: z.string().optional().or(z.literal('')), 
  })
});

// 2. LOGIN VALIDATOR
export const loginValidator = z.object({
  body: z.object({ // ✅ Match the middleware's 'body' wrapper
    loginId: z.string().min(1, 'Email or User ID is required'),
    password: z.string().min(6, 'Password is required'),
    role: z.enum(['employee', 'manager', 'admin']),
  })
});

// 3. FORGOT PASSWORD
export const forgotPasswordValidator = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  })
});

// 4. RESET PASSWORD
export const resetPasswordValidator = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
});