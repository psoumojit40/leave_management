import { z } from 'zod';

export const createHolidayValidator = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  
  date: z.coerce.date({
    message: "Please provide a valid date format",
  }),
  
  duration: z.coerce.number().min(1, 'Duration must be at least 1 day').default(1),

  type: z.enum(['Public', 'Company', 'Observance']),
  
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
});

export const updateHolidayValidator = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
    
  date: z.coerce.date({
    message: "Please provide a valid date format",
  }).optional(),
  
  type: z.enum(['Public', 'Company', 'Observance']).optional(),

  duration: z.coerce.number().min(1).optional(),
  
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
});

export const idValidator = z.object({
  id: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), { 
    message: 'Invalid ID format' 
  })
});