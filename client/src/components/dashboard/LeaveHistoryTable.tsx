'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Badge from '@/components/ui/Badge';
import { formatDate, getLeaveTypeDisplayName } from '@/utils/dateUtils';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function LeaveHistoryTable() {
  const { requests, loading } = useSelector((state: RootState) => state.leave);

  // Show only the 5 most recent requests on the dashboard
  const recentRequests = requests.slice(0, 5);

  if (loading) return <div className="h-40 bg-gray-50 animate-pulse rounded-xl" />;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Recent Leave Requests</h2>
        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-tight">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Applied On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentRequests.length > 0 ? (
              recentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                    {getLeaveTypeDisplayName(req.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{req.days} Days</div>
                    <div className="text-xs text-gray-400 font-medium">
                      {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={
                        req.status === 'approved' ? 'success' : 
                        req.status === 'rejected' ? 'error' : 'warning'
                      } 
                      dot
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-medium">
                    {formatDate(req.appliedOn)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400 italic">
                  No recent leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}