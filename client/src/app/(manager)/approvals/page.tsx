'use client'; // FIX 1: Directive for hooks

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

// FIX 2: Define the LeaveRequest interface
interface LeaveRequest {
  id: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedOn: string;
}

export default function ApprovalsPage() {
  // FIX 3: Type the state correctly
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data: LeaveRequest[] = [
          { 
            id: 1, 
            employeeName: 'Alice Johnson', 
            leaveType: 'Vacation', 
            startDate: '2026-04-15', 
            endDate: '2026-04-20', 
            days: 5,
            reason: 'Family trip',
            appliedOn: '2026-04-01'
          },
          { 
            id: 2, 
            employeeName: 'Carol Davis', 
            leaveType: 'Sick Leave', 
            startDate: '2026-04-10', 
            endDate: '2026-04-10', 
            days: 1,
            reason: 'Medical appointment',
            appliedOn: '2026-04-09'
          },
        ];
        setPendingRequests(data);
      } catch (error) {
        console.error('Failed to fetch pending requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleApprove = async (requestId: number) => {
    console.log(`Approving request ${requestId}`);
    // Optimistic UI update: remove from list immediately
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleReject = async (requestId: number) => {
    console.log(`Rejecting request ${requestId}`);
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full border-4 border-t-indigo-600 border-b-transparent w-12 h-12"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Approvals</h2>
        <p className="text-gray-600">
          Review and approve leave requests from your team members.
        </p>
      </div>
      
      {pendingRequests.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Days</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {pendingRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{request.employeeName}</div>
                      <div className="text-xs text-gray-500">Applied on {request.appliedOn}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {request.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {request.startDate} to {request.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {request.days}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleReject(request.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 py-20 text-center">
          <p className="text-gray-500 font-medium">No pending approvals at the moment.</p>
        </div>
      )}
    </div>
  );
}