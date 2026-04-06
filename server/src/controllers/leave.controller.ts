import { Request, Response, NextFunction } from 'express';
// FIX 1: Ensure .js extensions for ESM
import { LeaveRequest } from '../models/LeaveRequest.model.js';
import { User, IUser } from '../models/User.model.js';
import { logAudit } from '../services/auditLogger.service.js';

// FIX 2: Interface to handle the req.user property
interface AuthRequest extends Request {
  user?: IUser;
}

export const getLeaveRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // FIX 3: Explicitly cast query params to 'string' to solve the string | string[] error
    const employeeId = req.query.employeeId as string;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const filter: any = {};
    
    if (employeeId && (req.user.role === 'manager' || req.user.role === 'admin')) {
      filter.employeeId = employeeId;
    } else {
      filter.employeeId = req.user._id;
    }
    
    if (status) filter.status = status;
    
    if (startDate && endDate) {
      filter.startDate = { $gte: new Date(startDate) };
      filter.endDate = { $lte: new Date(endDate) };
    }
    
    const leaveRequests = await LeaveRequest.find(filter)
      .populate('employeeId', 'name email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(leaveRequests);
  } catch (error) {
    next(error);
  }
};

export const getLeaveRequestById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // FIX 4: Generic type for populate so TS knows employeeId has sub-properties
    const leaveRequest = await LeaveRequest.findById(req.params.id as string)
      .populate<{ employeeId: { _id: string, name: string, email: string } }>('employeeId', 'name email')
      .populate('approvedBy', 'name');
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    const isOwner = leaveRequest.employeeId._id.toString() === req.user._id.toString();
    const isPrivileged = req.user.role === 'manager' || req.user.role === 'admin';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to view this leave request' });
    }
    
    res.json(leaveRequest);
  } catch (error) {
    next(error);
  }
};

export const createLeaveRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }
    
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    const leaveRequest = new LeaveRequest({
      employeeId: req.user._id,
      type,
      startDate: start,
      endDate: end,
      reason,
      days, // Now recognized thanks to model update
    });
    
    await leaveRequest.save();
    
    const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
      .populate('employeeId', 'name email');
    
    await logAudit(
      req.user._id.toString(),
      req.user.name,
      'Leave Request Created',
      leaveRequest._id.toString(),
      'LeaveRequest',
      `Leave request created: ${leaveRequest.type} from ${startDate} to ${endDate}`
    );
    
    res.status(201).json(populatedRequest);
  } catch (error) {
    next(error);
  }
};

export const updateLeaveRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const leaveRequest = await LeaveRequest.findById(req.params.id as string);
    if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });
    
    if (leaveRequest.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this leave request' });
    }
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leave requests can be updated' });
    }
    
    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) return res.status(400).json({ message: 'Start date must be before end date' });
    
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    leaveRequest.type = type;
    leaveRequest.startDate = start;
    leaveRequest.endDate = end;
    leaveRequest.reason = reason;
    leaveRequest.days = days;
    
    await leaveRequest.save();
    
    const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
      .populate('employeeId', 'name email');
    
    await logAudit(
      req.user._id.toString(),
      req.user.name,
      'Leave Request Updated',
      leaveRequest._id.toString(),
      'LeaveRequest',
      `Leave request updated: ${leaveRequest.type}`
    );
    
    res.json(populatedRequest);
  } catch (error) {
    next(error);
  }
};

export const deleteLeaveRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const leaveRequest = await LeaveRequest.findById(req.params.id as string);
    if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });
    
    if (leaveRequest.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this leave request' });
    }
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leave requests can be deleted' });
    }
    
    await leaveRequest.deleteOne();
    
    await logAudit(
      req.user._id.toString(),
      req.user.name,
      'Leave Request Deleted',
      req.params.id as string,
      'LeaveRequest',
      `Leave request deleted`
    );
    
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const approveLeaveRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const leaveRequest = await LeaveRequest.findById(req.params.id as string);
    if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leave requests can be approved' });
    }
    
    leaveRequest.status = 'approved';
    leaveRequest.approvedBy = req.user._id;
    leaveRequest.approvedOn = new Date();
    
    await leaveRequest.save();
    
    const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
      .populate<{ employeeId: { name: string } }>('employeeId', 'name email')
      .populate('approvedBy', 'name');
    
    await logAudit(
      req.user._id.toString(),
      req.user.name,
      'Leave Request Approved',
      leaveRequest._id.toString(),
      'LeaveRequest',
      `Leave request approved for: ${populatedRequest?.employeeId.name}`
    );
    
    res.json(populatedRequest);
  } catch (error) {
    next(error);
  }
};

export const rejectLeaveRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const leaveRequest = await LeaveRequest.findById(req.params.id as string);
    if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leave requests can be rejected' });
    }
    
    leaveRequest.status = 'rejected';
    leaveRequest.approvedBy = req.user._id;
    leaveRequest.approvedOn = new Date();
    
    await leaveRequest.save();
    
    const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
      .populate<{ employeeId: { name: string } }>('employeeId', 'name email')
      .populate('approvedBy', 'name');
    
    await logAudit(
      req.user._id.toString(),
      req.user.name,
      'Leave Request Rejected',
      leaveRequest._id.toString(),
      'LeaveRequest',
      `Leave request rejected for: ${populatedRequest?.employeeId.name}`
    );
    
    res.json(populatedRequest);
  } catch (error) {
    next(error);
  }
};

export const getLeaveBalances = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Standard mock data for leave balances
    const leaveBalances = {
      vacation: { used: 8, total: 20 },
      sick: { used: 2, total: 10 },
      personal: { used: 1, total: 5 },
    };
    res.json(leaveBalances);
  } catch (error) {
    next(error);
  }
};

export const getLeaveStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const leaveStats = {
      totalDays: 35,
      usedDays: 11,
      pendingDays: 1,
    };
    res.json(leaveStats);
  } catch (error) {
    next(error);
  }
};