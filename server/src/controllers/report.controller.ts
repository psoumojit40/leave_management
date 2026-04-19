import { Request, Response, NextFunction } from 'express';
// FIX 1: ESM .js extensions
import { LeaveRequest } from '../models/LeaveRequest.model.js';
import { AttendanceRecord } from '../models/AttendanceRecord.model.js';
import { User, IUser } from '../models/User.model.js';
import { logAudit } from '../services/auditLogger.service.js';

// FIX 2: Define the shape of a populated Employee
interface PopulatedEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  department?: string;
}

// FIX 3: Custom Request to include the user
interface AuthRequest extends Request {
  user?: IUser;
}

export const generatePayrollReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const filter: any = {};
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    // FIX 4: Use Generics in populate so TS knows employeeId is an object
    const attendanceRecords = await AttendanceRecord.find(filter)
      .populate<{ employeeId: PopulatedEmployee }>('employeeId', 'name department');
    
    const leaveFilter: any = { status: 'approved' };
    if (startDate && endDate) {
      leaveFilter.$or = [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ];
    }
    
    const leaveRequests = await LeaveRequest.find(leaveFilter)
      .populate<{ employeeId: PopulatedEmployee }>('employeeId', 'name department');
    
    const users = await User.find({ isActive: true });
    
    const payrollData = users.map(user => {
      // Accessing populated _id safely
      const userAttendances = attendanceRecords.filter(
        record => record.employeeId._id.toString() === user._id.toString()
      );
      
      const userLeaves = leaveRequests.filter(
        leave => leave.employeeId._id.toString() === user._id.toString()
      );
      
      const totalPresentDays = userAttendances.filter(r => r.status === 'present').length;
      const totalAbsentDays = userAttendances.filter(r => r.status === 'absent').length;
      const totalHalfDays = userAttendances.filter(r => r.status === 'half-day').length;
      
      const totalLeaveDays = userLeaves.reduce((sum, leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
        return sum + diffDays;
      }, 0);
      
      const totalHours = userAttendances.reduce((sum, record) => sum + record.hoursWorked, 0);
      
      return {
        employeeId: user._id,
        name: `${user.firstName} ${user.lastName}`,
        department: user.department || 'Not assigned',
        totalPresentDays,
        totalAbsentDays,
        totalHalfDays,
        totalLeaveDays,
        totalHours,
        totalPayableHours: totalHours - (totalLeaveDays * 8), 
      };
    });
    
    await logAudit(
      req.user._id.toString(),
      `${req.user.firstName} ${req.user.lastName}`,
      'Payroll Report Generated',
      'payroll-report',
      'Report',
      `Payroll report generated for period ${startDate} to ${endDate}`
    );
    
    res.json({
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      totalEmployees: payrollData.length,
      data: payrollData,
    });
  } catch (error) {
    next(error);
  }
};

export const generateAttendanceReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const filter: any = {};
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    const attendanceRecords = await AttendanceRecord.find(filter)
      .populate<{ employeeId: PopulatedEmployee }>('employeeId', 'firstName lastName department')
      .sort({ date: -1 });
    
    const reportData: Record<string, any> = {};
    
    attendanceRecords.forEach(record => {
      const empId = record.employeeId._id.toString();
      if (!reportData[empId]) {
        reportData[empId] = {
          employeeId: empId,
          name: `${record.employeeId.firstName} ${record.employeeId.lastName}`,
          department: record.employeeId.department || 'Not assigned',
          records: [],
          stats: { totalDays: 0, presentDays: 0, absentDays: 0, halfDays: 0, totalHours: 0 }
        };
      }
      
      reportData[empId].records.push({
        date: record.date,
        status: record.status,
        hoursWorked: record.hoursWorked,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
      });
      
      reportData[empId].stats.totalDays++;
      if (record.status === 'present') reportData[empId].stats.presentDays++;
      if (record.status === 'absent') reportData[empId].stats.absentDays++;
      if (record.status === 'half-day') reportData[empId].stats.halfDays++;
      reportData[empId].stats.totalHours += record.hoursWorked;
    });
    
    await logAudit(
      req.user._id.toString(),
      `${req.user.firstName} ${req.user.lastName}`,
      'Attendance Report Generated',
      'attendance-report',
      'Report',
      `Attendance report generated for period ${startDate} to ${endDate}`
    );
    
    res.json({
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      data: Object.values(reportData),
    });
  } catch (error) {
    next(error);
  }
};

export const generateLeaveReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const filter: any = { status: 'approved' };
    if (startDate && endDate) {
      filter.$or = [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ];
    }
    
    // Typing both employeeId and approvedBy for the leave report
    const leaveRequests = await LeaveRequest.find(filter)
      .populate<{ employeeId: PopulatedEmployee }>('employeeId', 'name department')
      .populate<{ approvedBy: { name: string } | null }>('approvedBy', 'name')
      .sort({ startDate: 1 });
    
    const reportData: Record<string, any> = {};
    
    leaveRequests.forEach(leave => {
      const empId = leave.employeeId._id.toString();
      const leaveType = leave.type;
      
      if (!reportData[empId]) {
        reportData[empId] = {
          employeeId: empId,
          name: `${leave.employeeId.firstName} ${leave.employeeId.lastName}`,
          department: leave.employeeId.department || 'Not assigned',
          leaveTypes: {},
          totalDays: 0,
        };
      }
      
      if (!reportData[empId].leaveTypes[leaveType]) {
        reportData[empId].leaveTypes[leaveType] = { count: 0, days: 0, requests: [] };
      }
      
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
      
      reportData[empId].leaveTypes[leaveType].count++;
      reportData[empId].leaveTypes[leaveType].days += diffDays;
      reportData[empId].leaveTypes[leaveType].requests.push({
        id: leave._id,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        appliedOn: leave.appliedOn,
        approvedBy: leave.approvedBy ? leave.approvedBy.name : 'System',
        approvedOn: leave.approvedAt,
      });
      
      reportData[empId].totalDays += diffDays;
    });
    
    await logAudit(
      req.user._id.toString(),
      `${req.user.firstName} ${req.user.lastName}`,
      'Leave Report Generated',
      'leave-report',
      'Report',
      `Leave report generated for period ${startDate} to ${endDate}`
    );
    
    res.json({
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      data: Object.values(reportData),
    });
  } catch (error) {
    next(error);
  }
};