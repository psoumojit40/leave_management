import { LeaveRequest } from '../models/LeaveRequest.model';
import { User } from '../models/User.model';
import { sendLeaveApprovalEmail, sendLeaveRejectionEmail } from './email.service';
import { logAudit } from './auditLogger.service';

export const createLeaveRequest = async (
  employeeId: string,
  leaveData: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  }
) => {
  const { type, startDate, endDate, reason } = leaveData;
  
  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    throw new Error('Start date must be before end date');
  }
  
  // Calculate number of days
  const timeDiff = end.getTime() - start.getTime();
  const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  
  // Create new leave request
  const leaveRequest = new LeaveRequest({
    employeeId,
    type,
    startDate: start,
    endDate: end,
    reason,
    days,
  });
  
  await leaveRequest.save();
  
  // Populate for response
  const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
    .populate('employeeId', 'name email')
    .populate('approvedBy', 'name');
  
  // Log audit
  const employee = await User.findById(employeeId).select('name');
  await logAudit(
    employeeId,
    employee?.name || 'Unknown',
    'Leave Request Created',
    leaveRequest._id.toString(),
    'LeaveRequest',
    `Leave request created: ${leaveRequest.type} from ${startDate} to ${endDate}`
  );
  
  return populatedRequest;
};

export const getLeaveRequests = async (
  filters: {
    employeeId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) => {
  const { employeeId, status, startDate, endDate } = filters;
  
  // Build filter
  const filter: any = {};
  
  if (employeeId) {
    filter.employeeId = employeeId;
  }
  
  if (status) {
    filter.status = status;
  }
  
  if (startDate && endDate) {
    filter.startDate = { $gte: new Date(startDate) };
    filter.endDate = { $lte: new Date(endDate) };
  }
  
  const leaveRequests = await LeaveRequest.find(filter)
    .populate('employeeId', 'name email')
    .populate('approvedBy', 'name')
    .sort({ createdAt: -1 });
  
  return leaveRequests;
};

export const getLeaveRequestById = async (id: string) => {
  const leaveRequest = await LeaveRequest.findById(id)
    .populate('employeeId', 'name email')
    .populate('approvedBy', 'name');
  
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }
  
  return leaveRequest;
};

export const updateLeaveRequest = async (
  id: string,
  updateData: {
    type?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
  }
) => {
  const leaveRequest = await LeaveRequest.findById(id);
  
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }
  
  // Check if request is still pending
  if (leaveRequest.status !== 'pending') {
    throw new Error('Only pending leave requests can be updated');
  }
  
  const { type, startDate, endDate, reason } = updateData;
  
  // Validate dates if provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      throw new Error('Start date must be before end date');
    }
    
    // Calculate number of days
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    leaveRequest.type = type || leaveRequest.type;
    leaveRequest.startDate = start || leaveRequest.startDate;
    leaveRequest.endDate = end || leaveRequest.endDate;
    leaveRequest.reason = reason || leaveRequest.reason;
    leaveRequest.days = days || leaveRequest.days;
  } else {
    // Update only provided fields
    if (type) leaveRequest.type = type;
    if (startDate) leaveRequest.startDate = new Date(startDate);
    if (endDate) leaveRequest.endDate = new Date(endDate);
    if (reason) leaveRequest.reason = reason;
  }
  
  await leaveRequest.save();
  
  // Populate for response
  const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
    .populate('employeeId', 'name email')
    .populate('approvedBy', 'name');
  
  // Log audit
  const employee = await User.findById(leaveRequest.employeeId).select('name');
  await logAudit(
    leaveRequest.employeeId.toString(),
    employee?.name || 'Unknown',
    'Leave Request Updated',
    leaveRequest._id.toString(),
    'LeaveRequest',
    `Leave request updated: ${leaveRequest.type} from ${leaveRequest.startDate} to ${leaveRequest.endDate}`
  );
  
  return populatedRequest;
};

export const deleteLeaveRequest = async (id: string) => {
  const leaveRequest = await LeaveRequest.findById(id);
  
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }
  
  // Check if request is still pending
  if (leaveRequest.status !== 'pending') {
    throw new Error('Only pending leave requests can be deleted');
  }
  
  await leaveRequest.deleteOne();
  
  // Log audit
  const employee = await User.findById(leaveRequest.employeeId).select('name');
  await logAudit(
    leaveRequest.employeeId.toString(),
    employee?.name || 'Unknown',
    'Leave Request Deleted',
    id,
    'LeaveRequest',
    `Leave request deleted`
  );
  
  return { message: 'Leave request deleted successfully' };
};

export const approveLeaveRequest = async (
  id: string,
  approverId: string
) => {
  const leaveRequest = await LeaveRequest.findById(id);
  
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }
  
  // Check if request is still pending
  if (leaveRequest.status !== 'pending') {
    throw new Error('Only pending leave requests can be approved');
  }
  
  // Update leave request
  leaveRequest.status = 'approved';
  leaveRequest.approvedBy = approverId;
  leaveRequest.approvedOn = new Date();
  
  await leaveRequest.save();
  
  // Populate for response
  const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
    .populate('employeeId', 'name email')
    .populate('approvedBy', 'name');
  
  // Log audit
  const employee = await User.findById(leaveRequest.employeeId).select('name');
  const approver = await User.findById(approverId).select('name');
  await logAudit(
    approverId,
    approver?.name || 'Unknown',
    'Leave Request Approved',
    leaveRequest._id.toString(),
    'LeaveRequest',
    `Leave request approved: ${leaveRequest.type} for employee ${employee?.name}`
  );
  
  // Send approval email
  const employeeEmail = (await User.findById(leaveRequest.employeeId).select('email')).email;
  const employeeName = employee?.name || 'Unknown';
  await sendLeaveApprovalEmail(
    employeeEmail,
    employeeName,
    leaveRequest.type,
    leaveRequest.startDate.toISOString().split('T')[0],
    leaveRequest.endDate.toISOString().split('T')[0]
  );
  
  return populatedRequest;
};

export const rejectLeaveRequest = async (
  id: string,
  approverId: string,
  reason?: string
) => {
  const leaveRequest = await LeaveRequest.findById(id);
  
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }
  
  // Check if request is still pending
  if (leaveRequest.status !== 'pending') {
    throw new Error('Only pending leave requests can be rejected');
  }
  
  // Update leave request
  leaveRequest.status = 'rejected';
  leaveRequest.approvedBy = approverId;
  leaveRequest.approvedOn = new Date();
  
  await leaveRequest.save();
  
  // Populate for response
  const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
    .populate('employeeId', 'name email')
    .populate('approvedBy', 'name');
  
  // Log audit
  const employee = await User.findById(leaveRequest.employeeId).select('name');
  const approver = await User.findById(approverId).select('name');
  await logAudit(
    approverId,
    approver?.name || 'Unknown',
    'Leave Request Rejected',
    leaveRequest._id.toString(),
    'LeaveRequest',
    `Leave request rejected: ${leaveRequest.type} for employee ${employee?.name}${reason ? ` with reason: ${reason}` : ''}`
  );
  
  // Send rejection email
  const employeeEmail = (await User.findById(leaveRequest.employeeId).select('email')).email;
  const employeeName = employee?.name || 'Unknown';
  await sendLeaveRejectionEmail(
    employeeEmail,
    employeeName,
    leaveRequest.type,
    leaveRequest.startDate.toISOString().split('T')[0],
    leaveRequest.endDate.toISOString().split('T')[0],
    reason
  );
  
  return populatedRequest;
};

export const getLeaveBalances = async (employeeId: string) => {
  // In a real app, you would calculate this based on company policy and used leave
  // For now, we'll return mock data
  
  // Get approved leave requests for this employee to calculate used days
  const leaveRequests = await LeaveRequest.find({
    employeeId,
    status: 'approved'
  });
  
  const usedDays = leaveRequests.reduce((total, leave) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1;
    return total + diffDays;
  }, 0);
  
  // Standard leave allocations (would come from company policy in real app)
  const leaveBalances = {
    vacation: { used: Math.min(usedDays * 0.6, 20), total: 20 }, // Assuming 60% of used days are vacation
    sick: { used: Math.min(usedDays * 0.3, 10), total: 10 },    // Assuming 30% of used days are sick leave
    personal: { used: Math.min(usedDays * 0.1, 5), total: 5 },  // Assuming 10% of used days are personal leave
  };
  
  return leaveBalances;
};

export const getLeaveStats = async (filters: {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
} = {}) => {
  const { employeeId, startDate, endDate } = filters;
  
  // Build filter
  const filter: any = { status: 'approved' }; // Only approved leaves
  
  if (employeeId) {
    filter.employeeId = employeeId;
  }
  
  if (startDate && endDate) {
    filter.$or = [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
    ];
  }
  
  const leaveRequests = await LeaveRequest.find(filter);
  
  // Calculate stats
  const totalDays = leaveRequests.reduce((sum, leave) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1;
    return sum + diffDays;
  }, 0);
  
  const usedDays = totalDays; // For approved leaves, used days = total days
  const pendingDays = await LeaveRequest.countDocuments({
    ...filter,
    status: 'pending'
  });
  
  const leaveStats = {
    totalDays,
    usedDays,
    pendingDays,
  };
  
  return leaveStats;
};