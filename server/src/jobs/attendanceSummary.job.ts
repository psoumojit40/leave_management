import cron from 'node-cron';
import { AttendanceRecord } from '../models/AttendanceRecord.model';
import { LeaveRequest } from '../models/LeaveRequest.model';
import { User } from '../models/User.model';
import { sendEmail } from '../services/email.service';
import { logAudit } from '../services/auditLogger.service';

/**
 * Cron job to send weekly attendance summary to HR/Payroll
 * Runs every Monday at 8:00 AM
 */
export const startAttendanceSummaryJob = () => {
  // Run every Monday at 8:00 AM
  cron.schedule('0 8 * * 1', async () => {
    console.log('Running attendance summary job...');
    
    try {
      // Calculate date range for the previous week
      const today = new Date();
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - 7);
      lastWeekStart.setHours(0, 0, 0, 0);
      
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - 1);
      lastWeekEnd.setHours(23, 59, 59, 999);
      
      // Get all active users
      const users = await User.find({ isActive: true });
      
      // Calculate attendance for each user
      const userAttendance: Array<{
        name: string;
        department: string;
        present: number;
        absent: number;
        halfDay: number;
        totalHours: number;
      }> = [];
      
      for (const user of users) {
        const attendanceRecords = await AttendanceRecord.find({
          employeeId: user._id,
          date: {
            $gte: lastWeekStart,
            $lte: lastWeekEnd
          }
        });
        
        const present = attendanceRecords.filter(r => r.status === 'present').length;
        const absent = attendanceRecords.filter(r => r.status === 'absent').length;
        const halfDay = attendanceRecords.filter(r => r.status === 'half-day').length;
        const totalHours = attendanceRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
        
        userAttendance.push({
          name: user.name,
          department: user.department || 'Not assigned',
          present,
          absent,
          halfDay,
          totalHours
        });
      }
      
      // Get approved leave requests for the same period
      const leaveRequests = await LeaveRequest.find({
        status: 'approved',
        startDate: { $lte: lastWeekEnd },
        endDate: { $gte: lastWeekStart }
      });
      
      const totalLeaveDays = leaveRequests.reduce((sum, leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const startDate = start < lastWeekStart ? lastWeekStart : start;
        const endDate = end > lastWeekEnd ? lastWeekEnd : end;
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1;
        return sum + diffDays;
      }, 0);
      
      // Get HR/Payroll email recipients (managers and admins)
      const recipients = await User.find({
        role: { $in: ['manager', 'admin'] }
      }).select('email name');
      
      // Send summary emails
      for (const recipient of recipients) {
        await sendEmail(
          recipient.email,
          'Weekly Attendance Summary',
          `Hello ${recipient.name},\n\nHere is the weekly attendance summary for the period ${lastWeekStart.toLocaleDateString()} to ${lastWeekEnd.toLocaleDateString()}:\n\n` +
          `Total Employees: ${users.length}\n` +
          `Total Present Days: ${userAttendance.reduce((sum, u) => sum + u.present, 0)}\n` +
          `Total Absent Days: ${userAttendance.reduce((sum, u) => sum + u.absent, 0)}\n` +
          `Total Half Days: ${userAttendance.reduce((sum, u) => sum + u.halfDay, 0)}\n` +
          `Total Leave Days: ${totalLeaveDays}\n` +
          `Total Hours Worked: ${userAttendance.reduce((sum, u) => sum + u.totalHours, 0)}\n\n` +
          `For detailed reports, please log in to the Leave Management System.\n\n` +
          `Best regards,\nLeave Management System`
        );
        
        console.log(`Sent attendance summary to ${recipient.name}`);
      }
      
      // Log the job execution
      await logAudit(
        'system',
        'System',
        'Weekly Attendance Summary Generated',
        'attendance-summary',
        'Job',
        `Weekly attendance summary generated and sent to ${recipients.length} recipients`
      );
      
      console.log(`Attendance summary job completed. Sent to ${recipients.length} recipients`);
      
    } catch (error) {
      console.error('Error in attendance summary job:', error);
    }
  });
  
  console.log('Attendance summary job scheduled: Runs every Monday at 8:00 AM');
};