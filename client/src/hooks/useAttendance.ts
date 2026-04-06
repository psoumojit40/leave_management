'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// 1. Interfaces
export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'half-day' | 'off';
  hoursWorked: number;
  employeeName?: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  totalHours: number;
}

export default function useAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Fetch Logic (Simulating API)
  const fetchAttendanceRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In production: const response = await axios.get('/api/attendance');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRecords: AttendanceRecord[] = [];
      const today = new Date();
      
      for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        mockRecords.push({
          id: `${dateString}-${i}`,
          date: dateString,
          status: isWeekend ? 'off' : 'present',
          hoursWorked: isWeekend ? 0 : 8,
          employeeName: 'John Doe',
        });
      }
      
      setAttendanceRecords(mockRecords);
    } catch (err) {
      setError('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Derived Stats (CLEANER: No separate state needed)
  // This updates automatically whenever attendanceRecords changes
  const attendanceStats = useMemo(() => {
    const stats = {
      totalDays: attendanceRecords.length,
      presentDays: attendanceRecords.filter(r => r.status === 'present').length,
      absentDays: attendanceRecords.filter(r => r.status === 'absent').length,
      halfDays: attendanceRecords.filter(r => r.status === 'half-day').length,
      totalHours: attendanceRecords.reduce((sum, r) => sum + r.hoursWorked, 0),
    };
    return stats;
  }, [attendanceRecords]);

  // 4. Mark Attendance
  const markAttendance = useCallback(async (date: string, status: AttendanceRecord['status'], hoursWorked: number) => {
    setLoading(true);
    try {
      // In production: await axios.post('/api/attendance', { date, status, hoursWorked });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newRecord: AttendanceRecord = {
        id: `new-${Date.now()}`,
        date,
        status,
        hoursWorked,
        employeeName: 'John Doe',
      };
      
      setAttendanceRecords(prev => {
        const filtered = prev.filter(r => r.date !== date);
        return [newRecord, ...filtered];
      });
      return true;
    } catch (err) {
      setError('Failed to update attendance');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 5. CSV Import
  const importAttendanceCSV = useCallback(async (csvData: string[][]) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newRecords: AttendanceRecord[] = csvData.slice(1).map((row, index) => ({
        id: `import-${Date.now()}-${index}`,
        date: row[1] || '',
        status: (row[2] || 'present').toLowerCase() as AttendanceRecord['status'],
        hoursWorked: parseFloat(row[3] || '0'),
        employeeName: 'Imported User',
      }));
      
      setAttendanceRecords(prev => [...newRecords, ...prev]);
    } catch (err) {
      setError('Import failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);

  return {
    attendanceRecords,
    attendanceStats,
    loading,
    error,
    fetchAttendanceRecords,
    markAttendance,
    importAttendanceCSV,
  };
}