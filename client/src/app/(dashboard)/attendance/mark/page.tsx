'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { pushNotification } from '@/store/notificationSlice';
import Button from '@/components/ui/Button';
import { CheckCircle2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function MarkAttendancePage() {
  const dispatch = useDispatch<AppDispatch>();
  
  // 1. Local State for Form
  const [status, setStatus] = useState<'present' | 'absent' | 'half-day'>('present');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // 2. Global Feedback: Trigger Toast
      toast.success(`Attendance marked as ${status} for ${date}`);

      // 3. Global Feedback: Sync with Redux Notification Bell
      dispatch(pushNotification({
        message: `Successfully marked attendance for ${date}.`,
        type: 'success'
      }));

    } catch (error) {
      toast.error('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mark Attendance</h1>
        <p className="text-gray-500 mt-1">Select the status and date for your daily check-in.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Date Picker */}
            <div>
              <label htmlFor="date" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Check-in Date
              </label>
              <div className="relative">
                <input
                  id="date"
                  type="date"
                  required
                  className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label htmlFor="status" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Status
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['present', 'absent', 'half-day'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      status === s 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <span className="capitalize font-bold text-sm">{s.replace('-', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-50" />

            <div className="flex items-center justify-end">
              <Button 
                type="submit" 
                variant="primary" 
                loading={loading}
                className="w-full sm:w-auto px-10 shadow-lg shadow-indigo-100"
              >
                Submit Attendance
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Reminder Card */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
        <div className="text-sm text-amber-800 leading-relaxed">
          <p className="font-bold mb-1">Important Note:</p>
          Attendance can only be marked for the current date or up to 2 days in the past. If you need to fix older records, please contact your manager.
        </div>
      </div>
    </div>
  );
}