import nodemailer from 'nodemailer';
import { config } from '../config/env';

// Create transporter
const transporter = nodemailer.createTransport({
  service: config.email.service,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  try {
    const mailOptions = {
      from: config.email.from || `"Leave Management System" <${config.email.user}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendLeaveApprovalEmail = async (
  employeeEmail: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string
) => {
  const subject = 'Leave Request Approved';
  const text = `
Hello ${employeeName},

Your leave request has been approved!

Details:
- Leave Type: ${leaveType}
- Start Date: ${startDate}
- End Date: ${endDate}

Please ensure that your responsibilities are covered during your absence.

Best regards,
Leave Management System
  `;

  await sendEmail(employeeEmail, subject, text);
};

export const sendLeaveRejectionEmail = async (
  employeeEmail: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  reason?: string
) => {
  const subject = 'Leave Request Rejected';
  const text = `
Hello ${employeeName},

Unfortunately, your leave request has been rejected.

Details:
- Leave Type: ${leaveType}
- Start Date: ${startDate}
- End Date: ${endDate}
${reason ? `- Reason: ${reason}` : ''}

Please contact your manager for more information.

Best regards,
Leave Management System
  `;

  await sendEmail(employeeEmail, subject, text);
};

export const sendAttendanceReminderEmail = async (
  managerEmail: string,
  managerName: string,
  pendingCount: number
) => {
  const subject = 'Attendance Reminder';
  const text = `
Hello ${managerName},

You have ${pendingCount} pending attendance records that need to be reviewed.

Please log in to the system to review and approve these records.

Best regards,
Leave Management System
  `;

  await sendEmail(managerEmail, subject, text);
};

export const sendWeeklyAttendanceSummary = async (
  recipientEmail: string,
  recipientName: string,
  summaryData: any
) => {
  const subject = 'Weekly Attendance Summary';
  const text = `
Hello ${recipientName},

Here is your weekly attendance summary:

- Total Employees: ${summaryData.totalEmployees}
- Total Present Days: ${summaryData.totalPresentDays}
- Total Absent Days: ${summaryData.totalAbsentDays}
- Total Half Days: ${summaryData.totalHalfDays}
- Total Leave Days: ${summaryData.totalLeaveDays}

Best regards,
Leave Management System
  `;

  await sendEmail(recipientEmail, subject, text);
};