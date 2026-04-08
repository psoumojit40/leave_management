import { z } from 'zod';

export const createLeaveValidator = z.object({
  body: z.object({
    // ✅ CHANGED: Now accepts any string to match your database LeaveSettings
    type: z.string().min(1, 'Leave type is required'),
    
    // ✅ ADDED: Backend needs to validate the number of days sent from frontend
    days: z.number().min(0.5, 'Minimum leave duration is 0.5 days'),

    startDate: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      { message: 'Invalid start date format' }
    ),
    endDate: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      { message: 'Invalid end date format' }
    ),
    reason: z.string().min(1, 'Reason is required').max(500, 'Reason must not exceed 500 characters'),
  }).refine(
    (data) => {
      return Date.parse(data.endDate) >= Date.parse(data.startDate);
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate']
    }
  )
});

export const updateLeaveValidator = z.object({
  body: z.object({
    // ✅ CHANGED: Updated to optional string for dynamic types
    type: z.string().min(1).optional(),
    days: z.number().min(0.5).optional(),
    
    startDate: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      { message: 'Invalid start date format' }
    ).optional(),
    endDate: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      { message: 'Invalid end date format' }
    ).optional(),
    reason: z.string().min(1, 'Reason is required').max(500, 'Reason must not exceed 500 characters').optional(),
  }).refine(
    (data) => {
      const hasStartDate = !!data.startDate;
      const hasEndDate = !!data.endDate;
      if (hasStartDate !== hasEndDate) {
        return false;
      }
      
      if (hasStartDate && hasEndDate) {
        return Date.parse(data.endDate!) >= Date.parse(data.startDate!);
      }
      
      return true;
    },
    { 
      message: 'Both startDate and endDate must be provided together, and endDate must be on or after startDate',
      path: ['endDate']
    }
  )
});

export const idValidator = z.object({
  params: z.object({
    id: z.string().refine(
      (val) => /^[0-9a-fA-F]{24}$/.test(val),
      { message: 'Invalid ID format' }
    )
  })
});