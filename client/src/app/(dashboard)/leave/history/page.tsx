'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

// ✅ 1. Interface updated to handle both strings and populated objects
interface LeaveRequest {
  _id: string;
  leaveType: string | { _id: string; name: string } | null;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  createdAt: string;
  employeeId?: { firstName: string; lastName: string };
  approvedBy?: string;
  approvedAt?: string;
}

export default function LeaveHistoryPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

  const fetchLeaves = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leave', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLeaves(data);
      } else {
        throw new Error(data.message || "Failed to fetch leaves");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLeaves();
  }, [token]);

  // ✅ 2. Safe Helper to display the leave type without TypeScript errors
  // ✅ Copy this over your old renderLeaveType
  const renderLeaveType = (leave: any) => {
    // 1. Check if leaveType is an object with a name (Populated from LeaveSettings)
    if (leave.leaveType && typeof leave.leaveType === 'object' && leave.leaveType.name) {
      return leave.leaveType.name;
    }

    // 2. Check if leaveType is just a string
    if (typeof leave.leaveType === 'string' && leave.leaveType.trim() !== "") {
      return leave.leaveType;
    }

    // 3. Check if the field is actually just called 'type' (Common in some models)
    if (leave.type && typeof leave.type === 'string') {
      return leave.type;
    }

    // 4. Check if 'type' is an object
    if (leave.type && typeof leave.type === 'object' && leave.type.name) {
      return leave.type.name;
    }

    return 'Misc Leave'; // Better than "Unknown" for the UI
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Approved</span>;
      case 'Pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Pending</span>;
      case 'Rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  if (selectedLeave) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-6">
            <h2 className="text-2xl font-black text-gray-900">Leave Request Details</h2>
            {getStatusBadge(selectedLeave.status)}
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Leave Type</p>
              {/* ✅ Details Fix */}
              <p className="text-lg font-bold text-gray-900">{renderLeaveType(selectedLeave)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Employee / Request ID</p>
              <p className="text-lg font-bold text-gray-900">
                {selectedLeave.employeeId ? `${selectedLeave.employeeId.firstName} ${selectedLeave.employeeId.lastName}` : selectedLeave._id.slice(-6).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Start Date</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(selectedLeave.startDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">End Date</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(selectedLeave.endDate)}</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reason for Leave</p>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-gray-600 font-medium italic">"{selectedLeave.reason || 'No reason provided.'}"</p>
            </div>
          </div>

          {selectedLeave.status !== 'Pending' && (
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-50 grid grid-cols-2 gap-8 mb-6">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Processed By</p>
                <p className="text-base font-bold text-blue-900">
                  {/* ✅ If it's the manager object, show the full name. Otherwise, show the string/ID. */}
                  {selectedLeave.approvedBy && typeof selectedLeave.approvedBy === 'object'
                    ? `${(selectedLeave.approvedBy as any).firstName} ${(selectedLeave.approvedBy as any).lastName}`
                    : (selectedLeave.approvedBy || 'Manager')}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Processed On</p>
                <p className="text-base font-bold text-blue-900">{formatDate(selectedLeave.approvedAt || new Date().toISOString())}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-50">
            <p className="text-xs font-bold text-gray-400">
              Application submitted on {formatDate(selectedLeave.createdAt)}
            </p>
            <button onClick={() => setSelectedLeave(null)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {isManagerOrAdmin ? 'Department Leave History' : 'My Leave History'}
          </h1>
          <p className="text-gray-500 font-medium mt-1">Track past and upcoming leave applications.</p>
        </div>
        {user?.role === 'employee' && (
          <Button variant="primary" className="rounded-xl px-6">Apply New</Button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                {/* ✅ Conditionally render Employee Header for Managers */}
                {isManagerOrAdmin && (
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                )}
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Date</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">End Date</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={isManagerOrAdmin ? 6 : 5} className="p-10 text-center text-gray-400 font-bold animate-pulse">Loading history...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan={isManagerOrAdmin ? 6 : 5} className="p-10 text-center text-gray-400 font-bold">No leave requests found.</td></tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* ✅ Conditionally render Employee Name for Managers */}
                    {isManagerOrAdmin && (
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-black text-gray-900">
                          {leave.employeeId ? `${leave.employeeId.firstName} ${leave.employeeId.lastName}` : 'Unknown Employee'}
                        </div>
                      </td>
                    )}

                    <td className="px-8 py-5 text-sm font-bold text-gray-900">{renderLeaveType(leave)}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatDate(leave.startDate)}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatDate(leave.endDate)}</td>
                    <td className="px-8 py-5">{getStatusBadge(leave.status)}</td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => setSelectedLeave(leave)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}