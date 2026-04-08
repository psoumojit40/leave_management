'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchCurrentUser } from '@/store/authSlice';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LeaveFormProps {
  open?: boolean; // ✅ Made optional
  onOpenChange?: (open: boolean) => void; // ✅ Made optional
}

export default function LeaveForm({ open, onOpenChange }: LeaveFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { settings } = useSelector((state: RootState) => state.leave);

  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [workingDays, setWorkingDays] = useState(0);

  // Filter settings based on gender
  const filteredSettings = useMemo(() => {
    return settings.filter((s) => {
      const name = s.name.toLowerCase();
      const userGender = user?.gender;
      if (userGender === 'male' && name.includes('maternity')) return false;
      if (userGender === 'female' && name.includes('paternity')) return false;
      return true;
    });
  }, [settings, user?.gender]);

  useEffect(() => {
    if (filteredSettings.length > 0 && !leaveType) {
      setLeaveType(filteredSettings[0].name);
    }
  }, [filteredSettings, leaveType]);

  const activeSetting = filteredSettings.find(s => s.name === leaveType) || filteredSettings[0];
  const defaultDays = activeSetting?.defaultDays || 0;
  const currentBalance = (user?.leaveBalances as any)?.[leaveType] ?? defaultDays;

  const calculateDays = useCallback((start: string | null, end: string | null) => {
    if (!start) return 0;
    if (halfDay) return 0.5;
    if (!end) return 1;

    let count = 0;
    const curDate = new Date(start);
    const finishDate = new Date(end);

    while (curDate <= finishDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }, [halfDay]);

  useEffect(() => {
    setWorkingDays(calculateDays(startDate, endDate));
  }, [startDate, endDate, calculateDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (workingDays > currentBalance) {
      setError(`Insufficient balance. You have ${currentBalance} days left.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const submissionData = {
        type: leaveType,
        startDate,
        endDate: halfDay ? startDate : endDate,
        reason: reason.trim(),
        days: workingDays
      };

      const response = await fetch('http://localhost:5000/api/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit');

      setSuccess(true);
      toast.success("Leave request submitted!");
      
      dispatch(fetchCurrentUser());

      // ✅ Redirect if on the standalone page, or close if in modal
      setTimeout(() => {
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          router.push('/leave/history');
        }
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 4. THE UI LOGIC: We define the form content once
  const FormInner = (
    <div className={open !== undefined ? "p-4" : ""}>
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm">
          <p className="font-bold">Success!</p>
          <p>Your leave request has been submitted.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
          <p className="font-bold">Application Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all cursor-pointer"
            required
          >
            {filteredSettings.map((leave) => (
              <option key={leave._id} value={leave.name}>{leave.name}</option>
            ))}
          </select>
          <p className="mt-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
            Current Balance: {currentBalance} Days Available
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {halfDay ? 'Select Date' : 'Select Date Range'}
            </label>
            <DateRangePicker
              startDate={startDate}
              endDate={halfDay ? startDate : endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(halfDay ? start : end);
              }}
            />
          </div>

          {workingDays > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs font-black text-gray-400 uppercase">Duration:</span>
              <span className="text-sm font-black text-indigo-600">{workingDays} Working Day{workingDays !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Leave</label>
          <textarea
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="block w-full rounded-xl border-gray-200 focus:border-indigo-500 text-sm p-4 border outline-none transition-all"
            placeholder="Provide a brief explanation..."
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
          {onOpenChange && (
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" disabled={loading} className="rounded-xl">
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={workingDays === 0 || loading}
            className="rounded-xl shadow-lg shadow-indigo-100 px-8"
          >
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );

  // ✅ 5. RENDER LOGIC: Wrap in Modal only if 'open' prop is passed
  if (open !== undefined && onOpenChange) {
    return (
      <Modal open={open} onClose={() => onOpenChange(false)} title="Apply for Leave">
        {FormInner}
      </Modal>
    );
  }

  // Otherwise, just render the form (for the standalone page)
  return FormInner;
}