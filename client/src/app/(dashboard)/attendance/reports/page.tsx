'use client'; // FIX 1: Directive for hooks

import { useEffect, useState } from 'react';

// FIX 2: Define the interface for a single attendance entry
interface AttendanceEntry {
  date: string;
  dayOfWeek: string;
  status: 'present' | 'absent' | 'half-day';
  hoursWorked: number;
}

export default function AttendanceReportsPage() {
  // FIX 3: Type the state correctly
  const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    const fetchAttendanceReports = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const year = parseInt(selectedMonth.split('-')[0]);
        const month = parseInt(selectedMonth.split('-')[1]);
        const daysInMonth = new Date(year, month, 0).getDate();
        
        const sampleData: AttendanceEntry[] = [];
        // Show first 10 days of the month for the demo
        for (let day = 1; day <= Math.min(10, daysInMonth); day++) {
          const dateObj = new Date(year, month - 1, day);
          sampleData.push({
            date: dateObj.toISOString().split('T')[0],
            dayOfWeek: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
            status: (['present', 'absent', 'half-day'] as const)[Math.floor(Math.random() * 3)],
            hoursWorked: Math.floor(Math.random() * 2) + 6,
          });
        }
        
        setAttendanceData(sampleData);
      } catch (error) {
        console.error('Failed to fetch attendance reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceReports();
  }, [selectedMonth]);

  // Derived stats
  const totalDays = attendanceData.length;
  const presentDays = attendanceData.filter(d => d.status === 'present').length;
  const absentDays = attendanceData.filter(d => d.status === 'absent').length;
  const halfDays = attendanceData.filter(d => d.status === 'half-day').length;
  const totalHours = attendanceData.reduce((sum, day) => sum + day.hoursWorked, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full border-4 border-t-indigo-600 border-b-transparent w-12 h-12"></div>
        <p className="mt-4 text-gray-600 font-medium">Generating report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Attendance Reports</h2>
        
        <div className="max-w-xs">
          <label htmlFor="monthSelect" className="block text-sm font-semibold text-gray-700 mb-1">
            Select Reporting Month
          </label>
          <select
            id="monthSelect"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {[...Array(12)].map((_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = date.toISOString().slice(0, 7);
              return (
                <option key={value} value={value}>
                  {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      
      {attendanceData.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Days</p>
              <p className="text-2xl font-bold text-gray-900">{totalDays}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow-sm border border-green-100 p-4">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Present</p>
              <p className="text-2xl font-bold text-green-700">{presentDays}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow-sm border border-red-100 p-4">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Absent</p>
              <p className="text-2xl font-bold text-red-700">{absentDays}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-100 p-4">
              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Half Days</p>
              <p className="text-2xl font-bold text-yellow-700">{halfDays}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg shadow-sm border border-indigo-100 p-4">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Hours</p>
              <p className="text-2xl font-bold text-indigo-700">{totalHours}h</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800">Daily Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {attendanceData.map((day) => (
                    <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{day.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.dayOfWeek}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          day.status === 'present' ? 'bg-green-100 text-green-800' :
                          day.status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {day.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{day.hoursWorked}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 py-20 text-center">
          <p className="text-gray-500 font-medium">No records found for the selected month.</p>
        </div>
      )}
    </div>
  );
}