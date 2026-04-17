import { Request, Response, NextFunction } from 'express';
import LeaveRequest from '../models/LeaveRequest.model.js';
import { User, IUser } from '../models/User.model.js';
import { logAudit } from '../services/auditLogger.service.js';
import { calculateWorkingDays } from '../utils/leaveCalculator.js';

// Interface to handle the req.user property correctly in TS
interface AuthRequest extends Request {
  user?: IUser;
}

// 1. APPLY FOR LEAVE (Employee)
export const createLeaveRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { type, startDate, endDate, reason } = req.body;

    const workingDays = calculateWorkingDays(new Date(startDate), new Date(endDate));

    if (workingDays <= 0) {
      return res.status(400).json({ message: 'Invalid date range. No working days selected.' });
    }

    const userBalances = req.user.leaveBalances;
    let currentBalance = 0;

    if (userBalances instanceof Map) {
      currentBalance = userBalances.get(type) ?? 0;
      if (currentBalance === 0) {
        const shortKey = type.split(' ')[0].toLowerCase();
        currentBalance = userBalances.get(shortKey) ?? 0;
      }
    } else {
      currentBalance = (userBalances as any)[type] || 0;
    }
    
    if (workingDays > currentBalance) {
      return res.status(400).json({ 
        message: `Insufficient balance. Requested: ${workingDays} days, but you have ${currentBalance} left.` 
      });
    }

    const leaveRequest = new LeaveRequest({
      employeeId: req.user._id, 
      department: req.user.department, 
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days: workingDays, 
      reason,
      status: 'pending',
    });

    await leaveRequest.save();

    await logAudit(
      req.user._id.toString(),
      `${req.user.firstName} ${req.user.lastName}`,
      'Leave Request Created',
      leaveRequest._id.toString(),
      'LeaveRequest',
      `Applied for ${workingDays} days of ${type}`
    );

    res.status(201).json(leaveRequest);
  } catch (error) {
    next(error);
  }
};

// 2. GET LEAVE HISTORY (Manager sees department, Employee sees own)
export const getLeaveRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    let query: any = {};

    if (req.user?.role === 'employee') {
      query.employeeId = req.user._id;
    }

    if (req.user?.role === 'manager') {
      query.department = req.user.department; 
    }

    if (status) {
      query.status = status;
    }

    // ✅ FIXED: Now populating 'approvedBy' so manager names show up in the history table/details
    const requests = await LeaveRequest.find(query)
      .populate('employeeId', 'firstName lastName department')
      .populate('approvedBy', 'firstName lastName') 
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// 3. APPROVE LEAVE (Manager Only)
export const approveLeaveRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const leaveReq = await LeaveRequest.findById(id);
    
    if (!leaveReq || leaveReq.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid request or already processed' });
    }

    const employee = await User.findById(leaveReq.employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const type = leaveReq.type;
    let currentBalance = employee.leaveBalances.get(type);

    if (currentBalance === undefined) {
      const shortKey = type.split(' ')[0].toLowerCase();
      currentBalance = employee.leaveBalances.get(shortKey);
    }

    const balanceBeforeDeduction = currentBalance ?? 0;
    const newBalance = Math.max(0, balanceBeforeDeduction - leaveReq.days);
    employee.leaveBalances.set(type, newBalance);

    leaveReq.status = 'approved';
    leaveReq.approvedBy = req.user._id;
    leaveReq.approvedAt = new Date(); 

    await employee.save();
    await leaveReq.save();

    await logAudit(
      req.user._id.toString(),
      `${req.user.firstName} ${req.user.lastName}`,
      'Leave Request Approved',
      leaveReq._id.toString(),
      'LeaveRequest',
      `Approved ${leaveReq.days} days for ${employee.firstName}`
    );

    res.json({ message: 'Leave approved successfully', leaveReq });
  } catch (error) {
    next(error);
  }
};

// 4. REJECT LEAVE (Manager Only)
export const rejectLeaveRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { managerComments } = req.body;
    const leaveReq = await LeaveRequest.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'rejected', 
        managerComments,
        approvedBy: req.user._id,
        approvedAt: new Date() // ✅ Renamed from approvedOn
      }, 
      { new: true }
    );

    res.json({ message: 'Leave request rejected', leaveReq });
  } catch (error) {
    next(error);
  }
};

// 5. GET BALANCES
export const getLeaveBalances = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json(req.user.leaveBalances || {});
};

// 6. GET STATS
export const getLeaveStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const stats = await LeaveRequest.aggregate([
      { $match: { employeeId: req.user._id } },
      { $group: { 
          _id: "$status", 
          totalDays: { $sum: "$days" },
          count: { $sum: 1 }
      }}
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// 7. GET SPECIFIC DETAIL
export const getLeaveRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const request = await LeaveRequest.findById(req.params.id)
      .populate('employeeId', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName');
    res.json(request);
  } catch (error) {
    res.status(404).json({ message: "Request not found" });
  }
};

// 8. DELETE/CANCEL
export const deleteLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) return res.status(404).json({ message: 'Not found' });

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel processed requests' });
    }

    await leaveRequest.deleteOne();
    res.json({ message: 'Leave request cancelled' });
  } catch (error) {
    res.status(500).json({ message: "Error deleting request" });
  }
};

// 9. UPDATE PENDING
export const updateLeaveRequest = async (req: AuthRequest, res: Response) => {
  res.json({ message: "Update logic placeholder" });
};

// 10. CLEAR HISTORY
export const clearLeaveHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const result = await LeaveRequest.deleteMany({
      department: req.user.department,
      status: { $in: ['approved', 'rejected'] }
    });

    res.json({ message: `Cleared ${result.deletedCount} records.` });
  } catch (error) {
    next(error);
  }
};