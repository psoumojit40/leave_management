import { startLeaveReminderJob } from './leaveReminder.job';
import { startAttendanceSummaryJob } from './attendanceSummary.job';

/**
 * Initialize and start all cron jobs
 */
export const initializeCronJobs = () => {
  console.log('Initializing cron jobs...');
  
  // Start the leave reminder job
  startLeaveReminderJob();
  
  // Start the attendance summary job
  startAttendanceSummaryJob();
  
  console.log('All cron jobs have been scheduled');
};

// Export individual job starters for testing
export { startLeaveReminderJob, startAttendanceSummaryJob };