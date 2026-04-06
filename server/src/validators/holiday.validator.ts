import { z } from 'zod';

export const createHolidayValidator = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: 'Invalid date format' }
  ),
  type: z.enum(['public', 'company', 'observance'], {
    errorMap: () => ({ message: 'Invalid holiday type' })
  }),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
});

export const updateHolidayValidator = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters').optional(),
  date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: 'Invalid date format' }
  ).optional(),
  type: z.enum(['public', 'company', 'observance']).optional(),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
});

export const idValidator = z.object({
  id: z.string().refine(
    (val) => /^[0-9a-fA-F]{24}$/.test(val),
    { message: 'Invalid ID format' }
  )
});