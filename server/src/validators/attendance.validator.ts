import { z } from 'zod';
import mongoose from 'mongoose';

// Individual field validations
const attendanceBody = z.object({
  date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: 'Invalid date format' }
  ),
  status: z.enum(['present', 'absent', 'half-day'], {
    // FIX: Changed from 'invalid_type_error' to 'message' as per your TS error
    message: 'Invalid status. Must be present, absent, or half-day'
  }),
  hoursWorked: z.number().min(0, 'Hours worked must be at least 0').max(24, 'Hours worked must not exceed 24'),
  checkInTime: z.string().refine(
    (time) => !time || !isNaN(Date.parse(`2000-01-01T${time}`)),
    { message: 'Invalid check-in time format (HH:MM)' }
  ).optional(),
  checkOutTime: z.string().refine(
    (time) => !time || !isNaN(Date.parse(`2000-01-01T${time}`)),
    { message: 'Invalid check-out time format (HH:MM)' }
  ).optional(),
}).refine(
  (data) => {
    const hasCheckIn = !!data.checkInTime;
    const hasCheckOut = !!data.checkOutTime;
    if (data.status === 'present' && (hasCheckIn !== hasCheckOut)) {
      return false;
    }
    return true;
  },
  { message: 'For present status, both check-in and check-out times must be provided together' }
);

// Wrapped for the validate middleware
export const attendanceValidator = z.object({
  body: attendanceBody
});

export const dateRangeValidator = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).refine(
    (data) => {
      const hasStartDate = !!data.startDate;
      const hasEndDate = !!data.endDate;
      if (hasStartDate !== hasEndDate) return false;
      if (hasStartDate && hasEndDate) {
        return Date.parse(data.endDate!) >= Date.parse(data.startDate!);
      }
      return true;
    },
    { message: 'Both startDate and endDate must be provided together, and endDate must be on or after startDate' }
  )
});

// Added missing idValidator
export const idValidator = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid record ID format',
    }),
  }),
});