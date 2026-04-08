'use client';

import { useEffect, useState, useMemo } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchLeaveData, fetchLeaveSettings } from '@/store/leaveSlice'; 
import { fetchNotifications } from '@/store/notificationSlice';
import { fetchCurrentUser } from '@/store/authSlice';

// Components
import LeaveHistoryTable from '@/components/dashboard/LeaveHistoryTable';
import TeamCalendar from '@/components/calendar/TeamCalendar';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import Button from '@/components/ui/Button';

// Icons
import { Plus, ArrowRight, CheckCircle, ChevronDown, UserCheck, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { settings, loading: leaveLoading } = useSelector((state: RootState) => state.leave); 
  
  const [selectedLeaveId, setSelectedLeaveId] = useState<string>(''); 
  const [presentCount, setPresentCount] = useState<number | null>(null);
  const [isFetchingCount, setIsFetchingCount] = useState(false);

  // 1. Initial Fetch
  useEffect(() => {
    dispatch(fetchLeaveData());
    dispatch(fetchLeaveSettings()); 
    dispatch(fetchNotifications());
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // ✅ 2. GENDER FILTER LOGIC
  // We filter the settings here so the rest of the component only sees valid categories
  const filteredSettings = useMemo(() => {
    return settings.filter((s) => {
      const name = s.name.toLowerCase();
      const gender = user?.gender;

      if (gender === 'male' && name.includes('maternity')) return false;
      if (gender === 'female' && name.includes('paternity')) return false;

      return true;
    });
  }, [settings, user?.gender]);

  // ✅ 3. Updated Auto-select (Uses filteredSettings)
  useEffect(() => {
    if (filteredSettings.length > 0 && !selectedLeaveId) {
      setSelectedLeaveId(filteredSettings[0]._id);
    }
  }, [filteredSettings, selectedLeaveId]);

  const handleCheckPresence = async () => {
    setIsFetchingCount(true);
    try {
      const res = await fetch('http://localhost:5000/api/attendance/present-today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPresentCount(data.count);
      toast.info(`${data.count} members from your department are present today.`);
    } catch (error) {
      toast.error("Failed to fetch presence data");
    } finally {
      setIsFetchingCount(false);
    }
  };

  if (user?.role === 'manager' || user?.role === 'admin') {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Good Morning, {user?.firstName || 'Manager'}!
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Here is an overview of your team's leave and availability.
            </p>
          </div>
          {/* <div className="flex items-center gap-3">
            <Button 
              onClick={handleCheckPresence}
              variant="primary" 
              className="shadow-xl shadow-indigo-100 px-6 rounded-2xl flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-all font-bold"
              disabled={isFetchingCount}
            >
              <UserCheck className="w-5 h-5" />
              {isFetchingCount ? 'Checking...' : 'Members Present Today'}
              {presentCount !== null && (
                <span className="ml-2 bg-white text-indigo-600 px-2 py-0.5 rounded-lg text-xs font-black">
                  {presentCount}
                </span>
              )}
            </Button>
          </div> */}
        </div>
        <ManagerDashboard />
      </div>
    );
  }

  // 🔵 UPDATED EMPLOYEE VIEW (Uses filteredSettings)
  const selectedSetting = filteredSettings.find(s => s._id === selectedLeaveId) || filteredSettings[0];
  
  const totalQuota = selectedSetting?.defaultDays || 0;
  const currentBalance = (user?.leaveBalances as any)?.[selectedSetting?.name] ?? totalQuota;
  const usedDays = totalQuota - currentBalance;
  const progressPercentage = totalQuota > 0 ? (currentBalance / totalQuota) * 100 : 0;
  const activeColor = selectedSetting?.color || 'bg-indigo-500';
  console.log("THE ACTIVE COLOR IS:", activeColor);
  
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Good Morning, {user?.firstName || 'Team'}!
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Track your leave and check your attendance for today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/attendance/mark">
            <Button variant="outline" className="px-6 rounded-2xl">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          </Link>
          <Link href="/leave/apply">
            <Button variant="primary" className="shadow-xl shadow-indigo-100 px-6 rounded-2xl">
              <Plus className="w-4 h-4 mr-2" />
              Apply Leave
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="relative group">
        {!user || filteredSettings.length === 0 ? (
          <div className="w-full h-48 bg-gray-50 animate-pulse rounded-[2.5rem] border border-gray-100" />
        ) : (
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
              
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 ${activeColor} bg-opacity-10 rounded-[1.5rem] flex items-center justify-center shadow-inner`}>
                  <Calendar className="w-10 h-10 text-gray-700 opacity-60" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                    Remaining {selectedSetting?.name}
                  </p>
                  <h2 className="text-5xl font-black text-gray-900 tracking-tighter">
                    {currentBalance} <span className="text-xl text-gray-300 tracking-normal font-bold ml-1">Days</span>
                  </h2>
                </div>
              </div>

              <div className="relative min-w-[240px]">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest absolute -top-6 left-2">
                  Select Leave Category
                </label>
                <div className="relative">
                  <select 
                    value={selectedLeaveId} 
                    onChange={(e) => setSelectedLeaveId(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border-2 border-gray-100 text-gray-900 font-bold py-4 px-6 pr-12 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer"
                  >
                    {/* ✅ UPDATED: Map over filteredSettings */}
                    {filteredSettings.map((setting) => (
                      <option key={setting._id} value={setting._id}>
                        {setting.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                  className={`${activeColor} h-4 rounded-full transition-all duration-1000 ease-out shadow-lg`} 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center px-1">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeColor}`}></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {currentBalance} Available
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {usedDays} Consumed
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Annual Quota: {totalQuota} Days
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Activity Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <LeaveHistoryTable />

          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Recent Attendance</h2>
              <Link href="/attendance/reports" className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 transition-colors uppercase tracking-[0.2em]">
                View Full Report
              </Link>
            </div>
            <AttendanceTable />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-2">
            <TeamCalendar />
          </div>

          <div className="relative overflow-hidden bg-gray-900 rounded-[2rem] p-8 text-white group cursor-pointer">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-1 tracking-tight">Company Policy</h3>
              <p className="text-gray-400 text-xs font-medium mb-8">Updated for Fiscal Year 2026</p>
              <div className="flex items-center text-sm font-bold group-hover:gap-3 transition-all">
                Review Handbook <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}