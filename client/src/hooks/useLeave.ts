'use client';

import { useState, useEffect, useCallback } from 'react';

// 1. Precise Interfaces
export interface LeaveRequest {
  id: string;
  type: 'Vacation' | 'Sick Leave' | 'Personal Leave';
  startDate: string;
  endDate: string;
  days: number; // Added: Storing the count makes UI rendering much easier
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  employeeName?: string;
}

export interface LeaveBalance {
  used: number;
  total: number;
}

export default function useLeave() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper: Calculate days between two date strings safely
  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // 2. Consolidated Fetch (Prevents the "Waterfall" effect)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock Requests
      const mockReqs: LeaveRequest[] = [
        { id: '1', type: 'Vacation', startDate: '2026-04-10', endDate: '2026-04-15', days: 6, reason: 'Family trip', status: 'approved', appliedOn: '2026-04-01', employeeName: 'John Doe' },
        { id: '2', type: 'Sick Leave', startDate: '2026-04-05', endDate: '2026-04-05', days: 1, reason: 'Flu', status: 'pending', appliedOn: '2026-04-03', employeeName: 'John Doe' },
      ];

      // Mock Balances
      const mockBalances = {
        vacation: { used: 8, total: 20 },
        sick: { used: 2, total: 10 },
        personal: { used: 1, total: 5 },
      };

      setLeaveRequests(mockReqs);
      setLeaveBalances(mockBalances);
    } catch (err) {
      setError('Unable to load leave data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Derived Stats (Derive from existing state to keep data in sync)
  const leaveStats = {
    totalDays: Object.values(leaveBalances).reduce((acc, b) => acc + b.total, 0),
    usedDays: Object.values(leaveBalances).reduce((acc, b) => acc + b.used, 0),
    pendingDays: leaveRequests.filter(r => r.status === 'pending').reduce((acc, r) => acc + r.days, 0),
  };

  // 4. Actions
  const submitLeaveRequest = useCallback(async (data: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn' | 'days'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const daysCount = calculateDays(data.startDate, data.endDate);
      
      const newRequest: LeaveRequest = {
        ...data,
        id: `LR-${Date.now()}`,
        days: daysCount,
        status: 'pending',
        appliedOn: new Date().toISOString().split('T')[0],
      };

      setLeaveRequests(prev => [newRequest, ...prev]);
      return true;
    } catch (err) {
      setError('Submission failed.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRequestStatus = useCallback(async (requestId: string, newStatus: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLeaveRequests(prev => prev.map(req => {
        if (req.id === requestId) {
          // If approved, we would logically update the used balance here too
          return { ...req, status: newStatus };
        }
        return req;
      }));
    } catch (err) {
      setError(`Failed to ${newStatus} request.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    leaveRequests,
    leaveBalances,
    leaveStats,
    loading,
    error,
    refresh: fetchAllData,
    submitLeaveRequest,
    updateRequestStatus, // Consolidated approve/reject into one clean function
    cancelLeaveRequest: (id: string) => setLeaveRequests(prev => prev.filter(r => r.id !== id)),
  };
}