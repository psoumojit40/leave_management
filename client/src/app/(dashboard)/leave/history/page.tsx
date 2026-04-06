'use client'; // FIX 1: Directive for hooks

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

// FIX 2: Define the LeaveRequest interface
interface LeaveRequest {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Cancelled';
}

export default function LeaveHistoryPage() {
  // FIX 3: Type the state correctly
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data: LeaveRequest[] = [
          { id: 1, type: 'Vacation', startDate: '2026-04-10', endDate: '2026-04-15', status: 'Approved' },
          { id: 2, type: 'Sick Leave', startDate: '2026-04-05', endDate: '2026-04-05', status: 'Pending' },
          { id: 3, type: 'Personal', startDate: '2026-03-20', endDate: '2026-03-21', status: 'Rejected' },
        ];
        setLeaveRequests(data);
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full border-4 border-t-indigo-600 border-b-transparent w-12 h-12"></div>
        <p className="mt-4 text-gray-600 font-medium">Retrieving history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave History</h2>
          <p className="text-sm text-gray-500">Track your past and upcoming leave applications.</p>
        </div>
        <Link href="/leave/apply">
          <Button size="sm">Apply New</Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {leaveRequests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No leave requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {leaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{request.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.startDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.endDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/leave/${request.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-bold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}