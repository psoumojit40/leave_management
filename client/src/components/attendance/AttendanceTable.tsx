'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'half-day' | 'off';
  hoursWorked: number;
}

export default function AttendanceTable() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAttendance = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/attendance/recent', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setRecords(data);
        }
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchRecentAttendance();
  }, [token]);

  // Helper: Format Date (2026-04-08)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper: Get Day Name (Wed, Thu, etc.)
  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Day</th>
            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Hours</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {loading ? (
            <tr>
              <td colSpan={4} className="p-12 text-center text-gray-400 font-bold animate-pulse uppercase text-[10px] tracking-widest">
                Fetching logs...
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-12 text-center text-gray-400 font-medium">
                No recent records found.
              </td>
            </tr>
          ) : (
            records.map((row) => (
              <tr key={row._id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-700">
                  {formatDate(row.date)}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-400 font-medium">
                  {getDayName(row.date)}
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-[10px] font-black rounded-full uppercase tracking-tighter border ${
                    row.status === 'present' ? 'bg-green-50 text-green-600 border-green-100' :
                    row.status === 'absent' ? 'bg-red-50 text-red-600 border-red-100' :
                    row.status === 'half-day' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-gray-50 text-gray-500 border-gray-100'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-gray-900">
                  {row.hoursWorked}h
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}