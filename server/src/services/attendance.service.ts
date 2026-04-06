import { AttendanceRecord } from '../models/AttendanceRecord.model';
import { User } from '../models/User.model';
import { logAudit } from './auditLogger.service';

export const markAttendance = async (
  employeeId: string,
  attendanceData: {
    date: string;
    status: 'present' | 'absent' | 'half-day';
    hoursWorked: number;
    checkInTime?: string;
    checkOutTime?: string;
  }
) => {
  const { date, status, hoursWorked, checkInTime, checkOutTime } = attendanceData;
  
  // Validate date
  const attendanceDate = new Date(date);
  if (isNaN(attendanceDate.getTime())) {
    throw new Error('Invalid date');
  }
  
  // Validate hours worked
  if (hoursWorked < 0 || hoursWorked > 24) {
    throw new Error('Hours worked must be between 0 and 24');
  }
  
  // Check if attendance already exists for this date
  const existingAttendance = await AttendanceRecord.findOne({
    employeeId,
    date: attendanceDate,
  });
  
  let attendanceRecord;
  if (existingAttendance) {
    // Update existing record
    existingAttendance.status = status;
    existingAttendance.hoursWorked = hoursWorked;
    existingAttendance.checkInTime = checkInTime ? new Date(checkInTime) : undefined;
    existingAttendance.checkOutTime = checkOutTime ? new Date(checkOutTime) : undefined;
    attendanceRecord = await existingAttendance.save();
  } else {
    // Create new record
    attendanceRecord = new AttendanceRecord({
      employeeId,
      date: attendanceDate,
      status,
      hoursWorked,
      checkInTime: checkInTime ? new Date(checkInTime) : undefined,
      checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
    });
    attendanceRecord = await attendanceRecord.save();
  }
  
  // Log audit
  const employee = await User.findById(employeeId).select('name');
  await logAudit(
    employeeId,
    employee?.name || 'Unknown',
    'Attendance Marked',
    attendanceRecord._id.toString(),
    'AttendanceRecord',
    `Attendance marked: ${status} for ${date} (${hoursWorked} hours)`
  );
  
  return attendanceRecord;
};

export const getAttendanceRecords = async (
  filters: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) => {
  const { employeeId, startDate, endDate } = filters;
  
  // Build filter
  const filter: any = {};
  
  if (employeeId) {
    filter.employeeId = employeeId;
  }
  
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  
  const attendanceRecords = await AttendanceRecord.find(filter)
    .populate('employeeId', 'name email')
    .sort({ date: -1 });
  
  return attendanceRecords;
};

export const getAttendanceStats = async (
  filters: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) => {
  const { employeeId, startDate, endDate } = filters;
  
  // Build filter
  const filter: any = {};
  
  if (employeeId) {
    filter.employeeId = employeeId;
  }
  
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  
  const attendanceRecords = await AttendanceRecord.find(filter);
  
  // Calculate stats
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
  const halfDays = attendanceRecords.filter(r => r.status === 'half-day').length;
  const totalHours = attendanceRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
  
  const stats = {
    totalDays,
    presentDays,
    absentDays,
    halfDays,
    totalHours,
  };
  
  return stats;
};

export const importAttendanceCSV = async (
  csvData: string[][], // Array of rows, each row is an array of column values
  importedBy: string // User ID of the person importing
) => {
  // Validate CSV data
  if (!csvData || csvData.length === 0) {
    throw new Error('CSV data is empty');
  }
  
  // Skip header row
  const dataRows = csvData.slice(1);
  
  if (dataRows.length === 0) {
    throw new Error('CSV data contains no records (only header)');
  }
  
  // Process each row
  const attendanceRecords = [];
  const errors = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNumber = i + 2; // +2 because we skipped header and array is 0-indexed
    
    try {
      // Expected columns: employeeId, date, status, hoursWorked, checkInTime, checkOutTime
      if (row.length < 4) {
        errors.push(`Row ${rowNumber}: Insufficient columns (minimum 4 required)`);
        continue;
      }
      
      const [employeeIdStr, dateStr, statusStr, hoursWorkedStr, checkInTimeStr, checkOutTimeStr] = row;
      
      // Validate employeeId
      if (!employeeIdStr) {
        errors.push(`Row ${rowNumber}: Employee ID is required`);
        continue;
      }
      
      // Validate date
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        errors.push(`Row ${rowNumber}: Invalid date format`);
        continue;
      }
      
      // Validate status
      const validStatuses = ['present', 'absent', 'half-day'];
      if (!validStatuses.includes(statusStr)) {
        errors.push(`Row ${rowNumber}: Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        continue;
      }
      
      // Validate hours worked
      const hoursWorked = parseFloat(hoursWorkedStr);
      if (isNaN(hoursWorked) || hoursWorked < 0 || hoursWorked > 24) {
        errors.push(`Row ${rowNumber}: Hours worked must be a number between 0 and 24`);
        continue;
      }
      
      // Validate checkInTime if provided
      let checkInTime = undefined;
      if (checkInTimeStr) {
        const inTime = new Date(checkInTimeStr);
        if (isNaN(inTime.getTime())) {
          errors.push(`Row ${rowNumber}: Invalid check-in time format`);
          continue;
        }
        checkInTime = inTime;
      }
      
      // Validate checkOutTime if provided
      let checkOutTime = undefined;
      if (checkOutTimeStr) {
        const outTime = new Date(checkOutTimeStr);
        if (isNaN(outTime.getTime())) {
          errors.push(`Row ${rowNumber}: Invalid check-out time format`);
          continue;
        }
        checkOutTime = outTime;
      }
      
      // Check if attendance already exists for this employee and date
      const existingAttendance = await AttendanceRecord.findOne({
        employeeId: employeeIdStr,
        date,
      });
      
      let attendanceRecord;
      if (existingAttendance) {
        // Update existing record
        existingAttendance.status = statusStr as any;
        existingAttendance.hoursWorked = hoursWorked;
        existingAttendance.checkInTime = checkInTime;
        existingAttendance.checkOutTime = checkOutTime;
        attendanceRecord = await existingAttendance.save();
      } else {
        // Create new record
        attendanceRecord = new AttendanceRecord({
          employeeId: employeeIdStr,
          date,
          status: statusStr as any,
          hoursWorked,
          checkInTime,
          checkOutTime,
        });
        attendanceRecord = await attendanceRecord.save();
      }
      
      attendanceRecords.push(attendanceRecord);
    } catch (error: any) {
      errors.push(`Row ${rowNumber}: ${error.message}`);
    }
  }
  
  // If there were errors, throw an exception with all errors
  if (errors.length > 0) {
    throw new Error(`CSV import failed with ${errors.length} errors:\n${errors.join('\n')}`);
  }
  
  // Log audit
  const importer = await User.findById(importedBy).select('name');
  await logAudit(
    importedBy,
    importer?.name || 'Unknown',
    'Attendance CSV Imported',
    'csv-import',
    'AttendanceRecord',
    `Attendance CSV imported by ${importer?.name || 'Unknown'} (${attendanceRecords.length} records processed)`
  );
  
  return {
    message: `Attendance CSV imported successfully. ${attendanceRecords.length} records processed.`,
    processedCount: attendanceRecords.length,
    errors: [],
  };
};