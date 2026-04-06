import { Request, Response, NextFunction } from 'express';
import { AttendanceRecord } from '../models/AttendanceRecord.model.js';
import { User, IUser } from '../models/User.model.js';
import { logAudit } from '../services/auditLogger.service.js';

// Extend the Request type to include the user property
interface AuthRequest extends Request {
  user?: IUser; 
}

export const markAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { date, status, hoursWorked, checkInTime, checkOutTime } = req.body;

    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });

    const attendanceDate = new Date(date);
    const existingAttendance = await AttendanceRecord.findOne({
      employeeId: req.user._id,
      date: attendanceDate,
    });

    let attendanceRecord;
    if (existingAttendance) {
      existingAttendance.status = status;
      existingAttendance.hoursWorked = hoursWorked;
      existingAttendance.checkInTime = checkInTime ? new Date(`2000-01-01T${checkInTime}`) : undefined;
      existingAttendance.checkOutTime = checkOutTime ? new Date(`2000-01-01T${checkOutTime}`) : undefined;
      attendanceRecord = await existingAttendance.save();
    } else {
      attendanceRecord = new AttendanceRecord({
        employeeId: req.user._id,
        date: attendanceDate,
        status,
        hoursWorked,
        checkInTime: checkInTime ? new Date(`2000-01-01T${checkInTime}`) : undefined,
        checkOutTime: checkOutTime ? new Date(`2000-01-01T${checkOutTime}`) : undefined,
      });
      attendanceRecord = await attendanceRecord.save();
    }

    await logAudit(
      req.user._id.toString(),
      req.user.name,
      'Attendance Marked',
      attendanceRecord._id.toString(),
      'AttendanceRecord',
      `Attendance marked: ${status} for ${date}`
    );

    res.json(attendanceRecord);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceRecords = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const filter: any = { employeeId: req.user._id };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendanceRecords = await AttendanceRecord.find(filter).sort({ date: -1 });
    res.json(attendanceRecords);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const records = await AttendanceRecord.find({ employeeId: req.user._id });

    const stats = {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      halfDay: records.filter(r => r.status === 'half-day').length,
      totalHours: records.reduce((acc, curr) => acc + curr.hoursWorked, 0)
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const importAttendanceCSV = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    // Stub for CSV import logic
    res.json({ message: 'CSV Import feature coming soon' });
  } catch (error) {
    next(error);
  }
};