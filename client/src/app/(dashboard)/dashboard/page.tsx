'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchLeaveData } from '@/store/leaveSlice';
import { fetchNotifications } from '@/store/notificationSlice';

// Components
import LeaveBalanceCard from '@/components/dashboard/LeaveBalanceCard';
import LeaveHistoryTable from '@/components/dashboard/LeaveHistoryTable';
import TeamCalendar from '@/components/calendar/TeamCalendar';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import Button from '@/components/ui/Button';

// Icons
import { Plus, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { balances, loading: leaveLoading } = useSelector((state: RootState) => state.leave);

  useEffect(() => {
    dispatch(fetchLeaveData());
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* SECTION 1: Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {/* <div className="p-1 bg-indigo-100 rounded-md">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div> */}
            {/* <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
              Employee Portal • 2026
            </span> */}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            {/* We use firstName directly now since it's already split in the database */}
            Good Morning, {user?.firstName || 'Team'}!
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Track your leave and check your attendance for today.
          </p>
        </div>

        {/* FIX: Corrected Links to match your folder structure */}
        <div className="flex items-center gap-3">
          <Link href="/attendance/mark">
            <Button variant="outline" className="px-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          </Link>
          <Link href="/leave/apply">
            <Button variant="primary" className="shadow-xl shadow-indigo-100 px-6">
              <Plus className="w-4 h-4 mr-2" />
              Apply Leave
            </Button>
          </Link>
        </div>
      </div>

      {/* SECTION 2: Leave Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaveLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
          ))
        ) : (
          Object.entries(balances).map(([type, data]) => (
            <LeaveBalanceCard
              key={type}
              type={type}
              used={data.used}
              total={data.total}
            />
          ))
        )}
      </div>

      {/* SECTION 3: Main Activity Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <LeaveHistoryTable />

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Recent Attendance</h2>
              {/* FIX: Corrected Path */}
              <Link href="/attendance/reports" className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                Full Report
              </Link>
            </div>
            <AttendanceTable />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm p-2">
            <TeamCalendar />
          </div>

          <div className="relative overflow-hidden bg-indigo-900 rounded-2xl p-6 text-white group cursor-pointer">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Company Policy</h3>
              <p className="text-indigo-200 text-xs mb-6">Last updated: March 2026</p>
              <div className="flex items-center text-sm font-bold group-hover:gap-2 transition-all">
                Read Handbook <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/40 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}