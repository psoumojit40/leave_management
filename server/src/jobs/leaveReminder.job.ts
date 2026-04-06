import cron from 'node-cron';
// FIX 1: Added .js extensions to all relative imports for ESM compatibility
import { LeaveRequest } from '../models/LeaveRequest.model.js';
import { User } from '../models/User.model.js';
import { sendEmail } from '../services/email.service.js';
import { logAudit } from '../services/auditLogger.service.js';

/**
 * Cron job to send reminders to managers about pending leave approvals
 * Runs every weekday at 9:00 AM
 */
export const startLeaveReminderJob = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * 1-5', async () => {
    console.log('Running leave reminder job...');
    
    try {
      // FIX 2: Added TypeScript generics to tell TS what the populated data looks like
      const pendingLeaves = await LeaveRequest.find({ status: 'pending' })
        .populate<{ employeeId: { _id: string; name: string; email: string; department: string } }>(
          'employeeId', 
          'name email department'
        );
      
      if (pendingLeaves.length === 0) {
        console.log('No pending leave requests to process');
        return;
      }
      
      // Group pending leaves by manager (based on department)
      const managerNotifications: Record<string, string[]> = {};
      
      for (const leave of pendingLeaves) {
        // Because of the generic above, TypeScript now knows these properties exist!
        const employeeDepartment = leave.employeeId.department;
        const employeeName = leave.employeeId.name;

        // Find the manager for this employee's department
        const manager = await User.findOne({
          role: 'manager',
          department: employeeDepartment
        });
        
        if (manager) {
          const managerIdStr = manager._id.toString();
          
          if (!managerNotifications[managerIdStr]) {
            managerNotifications[managerIdStr] = [];
          }
          
          managerNotifications[managerIdStr].push(
            `${employeeName} - ${leave.type} (${leave.startDate.toLocaleDateString()} - ${leave.endDate.toLocaleDateString()})`
          );
        }
      }
      
      // Send reminder emails to managers
      for (const [managerId, leaves] of Object.entries(managerNotifications)) {
        const manager = await User.findById(managerId);
        if (manager) {
          await sendEmail(
            manager.email,
            'Pending Leave Approvals Reminder',
            `Hello ${manager.name},\n\nYou have ${leaves.length} pending leave request(s) that need your approval:\n\n${leaves.join('\n')}\n\nPlease log in to the system to review and approve/reject these requests.\n\nBest regards,\nLeave Management System`
          );
          
          console.log(`Sent reminder to manager ${manager.name} about ${leaves.length} pending leaves`);
          
          // Optional: You imported logAudit, you can use it here!
          // await logAudit('SYSTEM', 'LEAVE_REMINDER_SENT', manager._id, { count: leaves.length });
        }
      }
      
      // Log the job execution
      console.log(`Leave reminder job completed. Notified ${Object.keys(managerNotifications).length} managers`);
      
    } catch (error) {
      console.error('Error in leave reminder job:', error);
    }
  });
  
  console.log('Leave reminder job scheduled: Runs every weekday at 9:00 AM');
};