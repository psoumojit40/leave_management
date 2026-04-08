'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Button from '@/components/ui/Button';
import { 
  CheckCircle2, 
  Clock, 
  LogOut, 
  CalendarCheck2,
  Timer,
  RefreshCcw,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

type AttendanceStep = 'idle' | 'checked-in' | 'completed';

export default function MarkAttendancePage() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [step, setStep] = useState<AttendanceStep>('idle');
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  
  // ✅ NEW: State for the live ticking clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // ✅ NEW: Update the clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const syncWithDatabase = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`http://localhost:5000/api/attendance/today?t=${timestamp}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate' // Forces browser to forget
        },
        cache: 'no-store' // 🚀 Forces Next.js App Router to never cache this
      });
      
      const data = await res.json();
      
      if (res.ok && data._id) {
        setRecord(data);
        setStep(data.checkOutTime ? 'completed' : 'checked-in');
      } else {
        // If 401 Unauthorized (expired token) or no record, reset to idle
        setRecord(null);
        setStep('idle');
      }
    } catch (err) {
      console.error("Sync error:", err);
      // Failsafe: Reset to idle if the server is unreachable
      setRecord(null);
      setStep('idle');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    syncWithDatabase();
  }, [syncWithDatabase, user?.id]);

  // ✅ UPDATED: Smart Check-In Logic based on Time
  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    let calculatedStatus = 'present';
    let shiftMessage = "Shift started successfully!";

    // Logic: 9:00 AM to 9:30 AM (Full Day Present)
    if (hours === 9 && minutes <= 30) {
      calculatedStatus = 'present';
      shiftMessage = "Full-day shift started successfully!";
    } 
    // Logic: 1:00 PM (13:00) to 1:30 PM (13:30) (Half Day)
    else if (hours === 13 && minutes <= 30) {
      calculatedStatus = 'half-day';
      shiftMessage = "Your half-day shift has started.";
    } 
    // Logic: Outside buffer windows
    else {
      calculatedStatus = 'present'; 
      shiftMessage = "Checked in outside of standard buffer times.";
      toast.warning("You are checking in outside the standard shift windows.");
    }

    try {
      const res = await fetch('http://localhost:5000/api/attendance/check-in', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: calculatedStatus })
      });

      if (res.ok) {
        // Show specific message based on time calculation
        toast.success(shiftMessage);
        await syncWithDatabase();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to start shift");
      }
    } catch (error) {
      toast.error('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/attendance/check-out', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast.info("Shift ended successfully!");
        await syncWithDatabase();
      }
    } catch (error) {
      toast.error('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestingReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/attendance/reset-testing', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.warning("Test mode: Session reset.");
        await syncWithDatabase();
      }
    } catch (error) {
      toast.error("Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Updating Console</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Work Console</h1>
        <p className="text-gray-500 text-lg">Manage your daily professional availability.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-indigo-100/50 overflow-hidden transition-all duration-300">
        <div className="p-10 md:p-14">
          
          {/* --- STEP 1: IDLE (Start Shift) --- */}
          {step === 'idle' && (
            <form onSubmit={handleCheckIn} className="space-y-10 text-center">
              
              {/* ✅ LIVE CLOCK DISPLAY */}
              <div className="inline-flex flex-col items-center justify-center bg-indigo-50/50 rounded-[2rem] p-8 mb-4 border border-indigo-100/50 w-full max-w-sm mx-auto">
                <Clock className="w-8 h-8 text-indigo-400 mb-4" />
                <div className="text-5xl font-black text-indigo-600 tracking-tighter font-mono">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
                  {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-800">Ready to start your shift?</h2>
              
              <Button 
                type="submit" 
                loading={loading} 
                className="w-full py-6 rounded-2xl text-xl font-bold shadow-xl shadow-indigo-200 hover:translate-y-[-2px] active:translate-y-[1px] transition-all bg-indigo-600 hover:bg-indigo-700"
              >
                Check In Now
              </Button>

              <div className="text-xs font-medium text-gray-400 mt-4 flex justify-center gap-6">
                <p>Full Day: <span className="font-bold text-gray-600">9:00 AM - 9:30 AM</span></p>
                <p>Half Day: <span className="font-bold text-gray-600">1:00 PM - 1:30 PM</span></p>
              </div>
            </form>
          )}

          {/* --- STEP 2: CHECKED-IN (Ongoing Shift) --- */}
          {step === 'checked-in' && (
            <div className="text-center space-y-8 py-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50/50 animate-pulse">
                  <Timer className="w-12 h-12" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-sm border border-green-100">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900">Session Active</h2>
                <p className="text-gray-500 font-medium italic">Status: <span className="text-indigo-600 font-bold uppercase not-italic">{record?.status}</span></p>
                <div className="mt-4 px-6 py-2 bg-indigo-50 rounded-full inline-flex items-center gap-2 text-indigo-700 font-bold border border-indigo-100">
                  <Clock className="w-4 h-4" />
                  Clocked In at {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={handleCheckOut} 
                  loading={loading} 
                  variant="outline" 
                  className="w-full py-5 rounded-2xl text-lg font-bold border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all group"
                >
                  <LogOut className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" /> 
                  End Work Session
                </Button>
              </div>
            </div>
          )}

          {/* --- STEP 3: COMPLETED (Shift Summary) --- */}
          {step === 'completed' && (
            <div className="text-center space-y-10 py-4">
              <div className="w-24 h-24 bg-gray-50 text-gray-400 rounded-[2.5rem] flex items-center justify-center mx-auto border border-gray-100 shadow-inner">
                <CalendarCheck2 className="w-12 h-12" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Work Day Finalized</h2>
                <p className="text-gray-500">Your professional log for today is locked and synced.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
                <div className="bg-gray-50/80 p-6 rounded-3xl border border-gray-100/50 backdrop-blur-sm text-left space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Productive Time</p>
                  <p className="text-2xl font-black text-indigo-600 font-mono tracking-tight">{record.hoursWorked} <span className="text-sm">HRS</span></p>
                </div>
                <div className="bg-gray-50/80 p-6 rounded-3xl border border-gray-100/50 backdrop-blur-sm text-right space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Logout Time</p>
                  <p className="text-2xl font-black text-gray-800 font-mono tracking-tight">
                    {new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <p className="text-sm font-bold text-indigo-500 animate-bounce">Excellent work today, {user?.firstName}!</p>
            </div>
          )}
        </div>
      </div>

      {/* --- REFINED RESET BUTTON (FOR TESTING) --- */}
      <div className="flex flex-col items-center pt-4 opacity-30 hover:opacity-100 transition-opacity">
        <button 
          onClick={handleTestingReset}
          className="group flex items-center space-x-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-red-500 transition-all border-b border-transparent hover:border-red-100 pb-1"
        >
          <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
          <span>Debug: Reset Daily Session</span>
        </button>
      </div>
    </div>
  );
}