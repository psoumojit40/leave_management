import { z } from 'zod';
import mongoose from 'mongoose';

// ✅ We define the body here. 
// We use a simpler error mapping that doesn't fight the TypeScript compiler.
const attendanceBody = z.object({
  status: z.enum(['present', 'absent', 'half-day'], {
    errorMap: (issue, ctx) => {
      // We check the code as a string to avoid property errors
      if (issue.code === 'invalid_enum_value' || issue.code === 'invalid_type') {
        return { message: 'Status must be present, absent, or half-day' };
      }
      return { message: ctx.defaultError };
    },
  }),
  
  // ✅ These are optional to prevent "Validation Failed" during Check-In
  date: z.string().optional(),
  hoursWorked: z.number().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
});

// Wrapped for the validate middleware
export const attendanceValidator = z.object({
  body: attendanceBody
});

export const dateRangeValidator = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
});

export const idValidator = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid record ID format',
    }),
  }),
});