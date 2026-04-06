import { z } from 'zod';

export const createLeaveValidator = z.object({
  type: z.enum(['vacation', 'sick', 'personal', 'bereavement', 'maternity', 'paternity', 'jury', 'military'], {
    errorMap: () => ({ message: 'Invalid leave type' })
  }),
  startDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: 'Invalid start date format' }
  ),
  endDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: 'Invalid end date format' }
  ).refine(
    (date, ctx) => {
      if (!ctx.parent.startDate) return true;
      return Date.parse(date) >= Date.parse(ctx.parent.startDate);
    },
    { message: 'End date must be on or after start date' }
  ),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must not exceed 500 characters'),
});

export const updateLeaveValidator = z.object({
  type: z.enum(['vacation', 'sick', 'personal', 'bereavement', 'maternity', 'paternity', 'jury', 'military']).optional(),
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
    // If startDate is provided, endDate must also be provided and vice versa
    const hasStartDate = !!data.startDate;
    const hasEndDate = !!data.endDate;
    if (hasStartDate !== hasEndDate) {
      return false;
    }
    
    // If both dates are provided, validate that endDate >= startDate
    if (hasStartDate && hasEndDate) {
      return Date.parse(data.endDate!) >= Date.parse(data.startDate!);
    }
    
    return true;
  },
  { message: 'Both startDate and endDate must be provided together, and endDate must be on or after startDate' }
);

export const idValidator = z.object({
  id: z.string().refine(
    (val) => /^[0-9a-fA-F]{24}$/.test(val),
    { message: 'Invalid ID format' }
  )
});