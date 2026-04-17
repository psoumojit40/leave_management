import { Request, Response, NextFunction } from 'express';
import { AttendanceRecord } from '../models/AttendanceRecord.model.js';
import { IUser } from '../models/User.model.js';
import { logAudit } from '../services/auditLogger.service.js';

// Extend the Request type to include the user property
interface AuthRequest extends Request {
  user?: IUser; 
}

// ✅ FIXED: Helper to get a bulletproof time range for "Today"
const getTodayRange = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
};

// 1. GET TODAY'S STATUS
export const getTodayStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { startOfDay, endOfDay } = getTodayRange();
    
    // Look for records within today's window
    const record = await AttendanceRecord.findOne({
      employeeId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!record) return res.json({ message: 'No record for today' });
    res.json(record);
  } catch (error) {
    next(error);
  }
};

// 2. CHECK-IN (Start Day)
export const checkIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body; // 'present' or 'half-day'
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { startOfDay, endOfDay } = getTodayRange();

    // Check if record already exists within today's window
    const existing = await AttendanceRecord.findOne({ 
      employeeId: req.user._id, 
      date: { $gte: startOfDay, $lte: endOfDay } 
    });
    
    if (existing) return res.status(400).json({ message: 'Already checked in for today' });

    const attendanceRecord = new AttendanceRecord({
      employeeId: req.user._id,
      date: startOfDay, // Save as exactly midnight for clean DB logs
      status: status || 'present',
      checkInTime: new Date(),
      hoursWorked: 0,
    });

    await attendanceRecord.save();

    await logAudit(
      req.user._id.toString(),
      req.user.firstName, 
      'Attendance Check-In',
      attendanceRecord._id.toString(),
      'AttendanceRecord',
      `Checked in at ${attendanceRecord.checkInTime}`
    );

    res.status(201).json(attendanceRecord);
  } catch (error) {
    next(error);
  }
};

// 3. CHECK-OUT (End Day & Calculate Hours)
export const checkOut = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { startOfDay, endOfDay } = getTodayRange();
    
    // Find today's record within the window
    const record = await AttendanceRecord.findOne({ 
      employeeId: req.user._id, 
      date: { $gte: startOfDay, $lte: endOfDay } 
    });

    if (!record) return res.status(404).json({ message: 'No check-in record found for today' });
    if (record.checkOutTime) return res.status(400).json({ message: 'Already checked out for today' });

    const endTime = new Date();
    record.checkOutTime = endTime;

    // Calculate duration in hours
    const diffMs = endTime.getTime() - record.checkInTime!.getTime();
    const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    record.hoursWorked = hours;

    await record.save();

    await logAudit(
      req.user._id.toString(),
      req.user.firstName,
      'Attendance Check-Out',
      record._id.toString(),
      'AttendanceRecord',
      `Checked out at ${endTime}. Total hours: ${hours}`
    );

    res.json(record);
  } catch (error) {
    next(error);
  }
};

// 4. GET HISTORY
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

// 5. GET STATS
export const getAttendanceStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const records = await AttendanceRecord.find({ employeeId: req.user._id });

    const stats = {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      halfDay: records.filter(r => r.status === 'half-day').length,
      totalHours: parseFloat(records.reduce((acc, curr) => acc + (curr.hoursWorked || 0), 0).toFixed(2))
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const importAttendanceCSV = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    res.json({ message: 'CSV Import feature coming soon' });
  } catch (error) {
    next(error);
  }
};

// Add this to your attendance controller
export const resetTodayAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { startOfDay, endOfDay } = getTodayRange();

    // Completely remove today's record for this user within the range
    await AttendanceRecord.deleteOne({
      employeeId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.json({ message: 'Today’s record cleared. You can check-in again!' });
  } catch (error) {
    next(error);
  }
};

// 7. GET RECENT ATTENDANCE (With Auto-Absent Gap Filling)
export const getRecentAttendance = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Helper to get local YYYY-MM-DD string to avoid timezone shifts
    const getLocalDateString = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const todayString = getLocalDateString(today);
    
    // 1. Establish the 7-day window boundary
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // 7 days including today
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 2. Fetch actual records from the database
    const dbRecords = await AttendanceRecord.find({
      employeeId: req.user._id,
      date: { $gte: sevenDaysAgo }
    }).lean(); // lean() converts MongoDB documents to standard Javascript objects

    // 3. Create a lookup map of existing records for lightning-fast checking
    const recordMap = new Map();
    dbRecords.forEach((record: any) => {
      const dateString = getLocalDateString(new Date(record.date));
      recordMap.set(dateString, record);
    });

    const mergedAttendance = [];

    // 4. Loop backwards from Today down to 6 days ago
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i);
      
      const dateString = getLocalDateString(currentDate);
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

      if (recordMap.has(dateString)) {
        // ✅ Real record exists in DB (Present/Half-day/etc)
        mergedAttendance.push(recordMap.get(dateString));
      } else {
        // ❌ No record exists in DB (Gap detected!)
        
        // UX Protection: Don't mark them "Absent" for TODAY if they just haven't clocked in yet this morning.
        if (dateString === todayString) continue; 

        // If it's a weekend, mark as 'off'. If it's a weekday, mark as 'absent'.
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        mergedAttendance.push({
          _id: `auto-${dateString}`, // Fake ID so React doesn't throw a "missing key" error
          employeeId: req.user._id,
          date: currentDate,
          status: isWeekend ? 'off' : 'absent',
          hoursWorked: 0
        });
      }
    }

    // Send the perfectly merged, gapless 7-day array to the frontend
    res.json(mergedAttendance);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent attendance" });
  }
};