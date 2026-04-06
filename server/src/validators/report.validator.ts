import { z } from 'zod';

export const dateRangeValidator = z.object({
  startDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: 'Invalid start date format' }
  ),
  endDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: 'Invalid end date format' }
  ),
}).refine(
  (data) => {
    // Validate that endDate >= startDate
    return Date.parse(data.endDate) >= Date.parse(data.startDate);
  },
  { message: 'End date must be on or after start date' }
);