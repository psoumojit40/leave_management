import { User } from '../models/User.model';
import { AttendanceRecord } from '../models/AttendanceRecord.model';
import { LeaveRequest } from '../models/LeaveRequest.model';
import { logAudit } from './auditLogger.service';
import { sendEmail } from './email.service';

export const generatePayrollExport = async (
  filters: {
    startDate?: string;
    endDate?: string;
  },
  exportedBy: string
) => {
  const { startDate, endDate } = filters;
  
  // Build filter
  const filter: any = {};
  
  // Filter by date range if specified
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  
  // Get attendance records
  const attendanceRecords = await AttendanceRecord.find(filter)
    .populate('employeeId', 'name employeeId department');
  
  // Get leave requests for the same period
  const leaveFilter: any = {};
  if (startDate && endDate) {
    leaveFilter.$or = [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
    ];
  }
  leaveFilter.status = 'approved'; // Only approved leaves
  
  const leaveRequests = await LeaveRequest.find(leaveFilter)
    .populate('employeeId', 'name employeeId department');
  
  // Get all active users
  const users = await User.find({ isActive: true });
  
  // Calculate payroll data
  const payrollData = users.map(user => {
    const userAttendances = attendanceRecords.filter(
      record => record.employeeId._id.toString() === user._id.toString()
    );
    
    const userLeaves = leaveRequests.filter(
      leave => leave.employeeId._id.toString() === user._id.toString()
    );
    
    const totalPresentDays = userAttendances.filter(
      record => record.status === 'present'
    ).length;
    
    const totalAbsentDays = userAttendances.filter(
      record => record.status === 'absent'
    ).length;
    
    const totalHalfDays = userAttendances.filter(
      record => record.status === 'half-day'
    ).length;
    
    const totalLeaveDays = userLeaves.reduce((sum, leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1;
      return sum + diffDays;
    }, 0);
    
    const totalHours = userAttendances.reduce(
      (sum, record) => sum + record.hoursWorked, 0
    );
    
    return {
      employeeId: user._id,
      employeeNumber: user.employeeId || `E${user._id.toString().slice(-6)}`,
      name: user.name,
      department: user.department || 'Not assigned',
      totalPresentDays,
      totalAbsentDays,
      totalHalfDays,
      totalLeaveDays,
      totalHours,
      totalPayableHours: totalHours - (totalLeaveDays * 8), // Assuming 8 hours per leave day
    };
  });
  
  // Generate CSV data
  const csvHeader = [
    'Employee ID',
    'Employee Number',
    'Name',
    'Department',
    'Present Days',
    'Absent Days',
    'Half Days',
    'Leave Days',
    'Total Hours',
    'Payable Hours'
  ];
  
  const csvRows = payrollData.map(row => [
    row.employeeId,
    row.employeeNumber,
    row.name,
    row.department,
    row.totalPresentDays,
    row.totalAbsentDays,
    row.totalHalfDays,
    row.totalLeaveDays,
    row.totalHours,
    row.totalPayableHours
  ]);
  
  const csvData = [csvHeader, ...csvRows];
  
  // Log audit
  const exporter = await User.findById(exportedBy).select('name');
  await logAudit(
    exportedBy,
    exporter?.name || 'Unknown',
    'Payroll Export Generated',
    'payroll-export',
    'Export',
    `Payroll export generated for period ${startDate} to ${endDate} by ${exporter?.name || 'Unknown'}`
  );
  
  return {
    csvData,
    filename: `payroll_export_${new Date().toISOString().slice(0, 10)}.csv`,
    count: payrollData.length
  };
};

export const generateAttendanceExport = async (
  filters: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  },
  exportedBy: string
) => {
  const { employeeId, startDate, endDate } = filters;
  
  // Build filter
  const filter: any = {};
  
  if (employeeId) {
    filter.employeeId = employeeId;
  }
  
  // Filter by date range if specified
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  
  // Get attendance records with employee details
  const attendanceRecords = await AttendanceRecord.find(filter)
    .populate('employeeId', 'name employeeId department')
    .sort({ date: 1 });
  
  // Generate CSV data
  const csvHeader = [
    'Employee ID',
    'Employee Number',
    'Name',
    'Department',
    'Date',
    'Status',
    'Hours Worked',
    'Check In Time',
    'Check Out Time'
  ];
  
  const csvRows = attendanceRecords.map(record => [
    record.employeeId._id,
    record.employeeId.employeeId || `E${record.employeeId._id.toString().slice(-6)}`,
    record.employeeId.name,
    record.employeeId.department || 'Not assigned',
    record.date.toISOString().split('T')[0],
    record.status,
    record.hoursWorked,
    record.checkInTime ? record.checkInTime.toISOString().split('T')[1].substring(0, 5) : '',
    record.checkOutTime ? record.checkOutTime.toISOString().split('T')[1].substring(0, 5) : ''
  ]);
  
  const csvData = [csvHeader, ...csvRows];
  
  // Log audit
  const exporter = await User.findById(exportedBy).select('name');
  await logAudit(
    exportedBy,
    exporter?.name || 'Unknown',
    'Attendance Export Generated',
    'attendance-export',
    'Export',
    `Attendance export generated for ${employeeId ? 'employee ' + employeeId : 'all employees'} from ${startDate || 'beginning'} to ${endDate || 'end'} by ${exporter?.name || 'Unknown'}`
  );
  
  return {
    csvData,
    filename: `attendance_export_${new Date().toISOString().slice(0, 10)}.csv`,
    count: attendanceRecords.length
  };
};

export const generateLeaveExport = async (
  filters: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  },
  exportedBy: string
) => {
  const { employeeId, startDate, endDate, status } = filters;
  
  // Build filter
  const filter: any = {};
  
  if (employeeId) {
    filter.employeeId = employeeId;
  }
  
  if (status) {
    filter.status = status;
  }
  
  // Filter by date range if specified
  if (startDate && endDate) {
    filter.$or = [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
    ];
  }
  
  // Get leave requests with employee details
  const leaveRequests = await LeaveRequest.find(filter)
    .populate('employeeId', 'name employeeId department')
    .sort({ startDate: 1 });
  
  // Generate CSV data
  const csvHeader = [
    'Employee ID',
    'Employee Number',
    'Name',
    'Department',
    'Leave Type',
    'Start Date',
    'End Date',
    'Days',
    'Reason',
    'Status',
    'Applied On',
    'Approved By',
    'Approved On'
  ];
  
  const csvRows = leaveRequests.map(leave => [
    leave.employeeId._id,
    leave.employeeId.employeeId || `E${leave.employeeId._id.toString().slice(-6)}`,
    leave.employeeId.name,
    leave.employeeId.department || 'Not assigned',
    leave.type,
    leave.startDate.toISOString().split('T')[0],
    leave.endDate.toISOString().split('T')[0],
    leave.days,
    leave.reason,
    leave.status,
    leave.appliedOn.toISOString().split('T')[0],
    leave.approvedBy ? leave.approvedBy.name : '',
    leave.approvedOn ? leave.approvedOn.toISOString().split('T')[0] : ''
  ]);
  
  const csvData = [csvHeader, ...csvRows];
  
  // Log audit
  const exporter = await User.findById(exportedBy).select('name');
  await logAudit(
    exportedBy,
    exporter?.name || 'Unknown',
    'Leave Export Generated',
    'leave-export',
    'Export',
    `Leave export generated for ${employeeId ? 'employee ' + employeeId : 'all employees'} from ${startDate || 'beginning'} to ${endDate || 'end'} by ${exporter?.name || 'Unknown'}`
  );
  
  return {
    csvData,
    filename: `leave_export_${new Date().toISOString().slice(0, 10)}.csv`,
    count: leaveRequests.length
  };
};