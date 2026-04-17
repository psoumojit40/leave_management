'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { CalendarX2, Loader2, CalendarDays } from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'half-day' | 'off';
  hoursWorked: number;
}

export default function AttendanceReportsPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  
  // Set default month to Current Month (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFutureMonth, setIsFutureMonth] = useState(false);

  // Generate options for the dropdown (e.g., Last 6 months + Current + 1 Future)
  // Generate options for the dropdown (e.g., Last 5 Years + Current + 1 Future)
  const monthOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    
    // ✅ Changed -6 to -60 to generate 5 years of past months!
    for (let i = -60; i <= 1; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label, date: d });
    }
    
    return options.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, []);

  const fetchAndProcessReport = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setIsFutureMonth(false);

    try {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const year = parseInt(yearStr);
      const monthIndex = parseInt(monthStr) - 1;

      const targetMonth = new Date(year, monthIndex, 1);
      const now = new Date();

      // 1. Check if it's a future month
      if (
        targetMonth.getFullYear() > now.getFullYear() ||
        (targetMonth.getFullYear() === now.getFullYear() && targetMonth.getMonth() > now.getMonth())
      ) {
        setIsFutureMonth(true);
        setRecords([]);
        setLoading(false);
        return;
      }

      // 2. Define API date boundaries (Start of month to End of month)
      const startDate = new Date(year, monthIndex, 1).toISOString();
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59).toISOString();

      // 3. Fetch real data from backend
      const res = await fetch(`http://localhost:5000/api/attendance?startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const rawRecords = await res.json();

      // 4. Map existing records by local date string
      const recordMap = new Map();
      rawRecords.forEach((r: any) => {
        const localDate = new Date(r.date);
        const dateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
        recordMap.set(dateStr, r);
      });

      // 5. Gap Filling Logic (Up to today, or end of month if past month)
      const isCurrentMonth = targetMonth.getFullYear() === now.getFullYear() && targetMonth.getMonth() === now.getMonth();
      const daysToFill = isCurrentMonth ? now.getDate() : new Date(year, monthIndex + 1, 0).getDate();
      
      const merged: AttendanceRecord[] = [];
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      for (let i = 1; i <= daysToFill; i++) {
        const currentD = new Date(year, monthIndex, i);
        const dateStr = `${currentD.getFullYear()}-${String(currentD.getMonth() + 1).padStart(2, '0')}-${String(currentD.getDate()).padStart(2, '0')}`;

        if (recordMap.has(dateStr)) {
          merged.push(recordMap.get(dateStr));
        } else {
          // Prevent marking today as absent if they just haven't clocked in yet
          if (dateStr === todayStr) continue;

          const dayOfWeek = currentD.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          merged.push({
            _id: `gap-${dateStr}`,
            date: currentD.toISOString(),
            status: isWeekend ? 'off' : 'absent',
            hoursWorked: 0
          });
        }
      }

      // Sort newest dates first
      merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(merged);

    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, token]);

  useEffect(() => {
    fetchAndProcessReport();
  }, [fetchAndProcessReport]);

  // Derived Stats
  const stats = useMemo(() => {
    let present = 0, absent = 0, halfDay = 0, totalHours = 0, off = 0;
    records.forEach(r => {
      if (r.status === 'present') present++;
      if (r.status === 'absent') absent++;
      if (r.status === 'half-day') halfDay++;
      if (r.status === 'off') off++;
      totalHours += r.hoursWorked || 0;
    });
    return { present, absent, halfDay, off, totalHours: Math.round(totalHours * 10) / 10 };
  }, [records]);

  // Helpers
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Attendance Reports</h1>
          <p className="text-gray-500 font-medium mt-1">Select a month to view your historical attendance log.</p>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Reporting Month</label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-50 border-2 border-transparent focus:border-indigo-500 text-gray-900 text-sm font-bold rounded-2xl px-6 py-4 outline-none transition-all cursor-pointer min-w-[200px]"
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Compiling Report...</p>
        </div>
      ) : isFutureMonth ? (
        <div className="bg-white rounded-[2.5rem] p-16 border border-gray-100 shadow-sm text-center">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-300 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <CalendarX2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Month Hasn't Started</h3>
          <p className="text-gray-500 font-medium">There are no attendance records available for future dates.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Working Days</p>
              {/* ✅ Subtract weekends from the total calendar days */}
              <p className="text-3xl font-black text-gray-900">{records.length - stats.off}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-3xl border border-green-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Present</p>
              <p className="text-3xl font-black text-green-700">{stats.present}</p>
            </div>
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Absent</p>
              <p className="text-3xl font-black text-red-700">{stats.absent}</p>
            </div>
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Half Days</p>
              <p className="text-3xl font-black text-amber-700">{stats.halfDay}</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Total Hours</p>
              <p className="text-3xl font-black text-indigo-700">{stats.totalHours}h</p>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
                Daily Breakdown
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Day</th>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-16 text-center text-gray-400 font-medium">
                        No logs recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    records.map((row) => (
                      <tr key={row._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-10 py-5 whitespace-nowrap text-sm font-medium text-gray-700">
                          {formatDate(row.date)}
                        </td>
                        <td className="px-10 py-5 whitespace-nowrap text-sm text-gray-400 font-medium">
                          {getDayName(row.date)}
                        </td>
                        <td className="px-10 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-[10px] font-black rounded-full uppercase tracking-tighter border ${
                            row.status === 'present' ? 'bg-green-50 text-green-600 border-green-100' :
                            row.status === 'absent' ? 'bg-red-50 text-red-600 border-red-100' :
                            row.status === 'half-day' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-gray-50 text-gray-500 border-gray-100'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-10 py-5 whitespace-nowrap text-sm font-black text-gray-900">
                          {row.hoursWorked}h
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}