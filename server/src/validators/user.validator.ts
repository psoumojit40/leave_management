import { z } from 'zod';

export const createUserValidator = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must not exceed 100 characters'),
  role: z.enum(['employee', 'manager', 'admin']).default('employee'),
  department: z.string().max(100, 'Department must not exceed 100 characters').optional(),
});

export const updateUserValidator = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['employee', 'manager', 'admin']).optional(),
  department: z.string().max(100, 'Department must not exceed 100 characters').optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must not exceed 100 characters').optional(),
});

export const idValidator = z.object({
  id: z.string().refine(
    (val) => /^[0-9a-fA-F]{24}$/.test(val),
    { message: 'Invalid ID format' }
  )
});