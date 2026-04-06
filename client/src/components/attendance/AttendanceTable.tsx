'use client';

import React from 'react';

// FIX 1: Define the Interface for Type Safety
interface AttendanceRecord {
  date: string;
  day: string;
  status: 'present' | 'absent' | 'half-day' | 'off';
  hours: number;
}

export default function AttendanceTable() {
  // FIX 2: Apply the interface to the sample data
  const attendanceData: AttendanceRecord[] = [
    { date: '2026-04-01', day: 'Wed', status: 'present', hours: 8 },
    { date: '2026-04-02', day: 'Thu', status: 'present', hours: 8 },
    { date: '2026-04-03', day: 'Fri', status: 'present', hours: 8 },
    { date: '2026-04-04', day: 'Sat', status: 'off', hours: 0 },
    { date: '2026-04-05', day: 'Sun', status: 'off', hours: 0 },
    { date: '2026-04-06', day: 'Mon', status: 'present', hours: 8 },
    { date: '2026-04-07', day: 'Tue', status: 'present', hours: 8 },
    { date: '2026-04-08', day: 'Wed', status: 'present', hours: 8 },
    { date: '2026-04-09', day: 'Thu', status: 'present', hours: 8 },
    { date: '2026-04-10', day: 'Fri', status: 'present', hours: 8 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Recent Attendance</h2>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          View History
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Day</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hours</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {attendanceData.map((row) => (
              <tr key={row.date} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                  {row.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.day}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2.5 py-0.5 inline-flex text-[11px] font-bold leading-5 rounded-full uppercase tracking-tighter ${
                    row.status === 'present' ? 'bg-green-100 text-green-700' :
                    row.status === 'absent' ? 'bg-red-100 text-red-700' :
                    row.status === 'half-day' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {row.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {row.hours}h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}