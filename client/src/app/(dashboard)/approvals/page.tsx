'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Users, Info, CheckCircle, XCircle, Trash2, Calendar, ArrowLeft } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ApprovalsHistoryPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Fetch all requests - we will filter for approved/rejected in the frontend 
      // or you can create a specific backend query for status=processed
      const res = await fetch('http://localhost:5000/api/leave', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      // Filter out 'pending' so we only see 'approved' and 'rejected'
      const processed = data.filter((req: any) => req.status !== 'pending');
      setHistory(processed);
    } catch (error) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure? This will permanently delete all APPROVED and REJECTED records for your department.")) return;

    try {
      const res = await fetch('http://localhost:5000/api/leave/history/clear', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to clear");
      toast.success("History cleared successfully!");
      setHistory([]); // Reset local state
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Manager Portal</p>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Approval History</h1>
            </div>
          </div>
          <Button
            onClick={handleClearHistory}
            variant="outline"
            className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 font-bold"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear All History
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50 sticky top-0 z-10">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Applied On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center animate-pulse text-gray-400 font-bold">Loading records...</td></tr>
              ) : history.length > 0 ? (
                history.map((req: any) => (
                  <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{req.employeeId?.firstName} {req.employeeId?.lastName}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{req.employeeId?.department}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      {/* ✅ Changed "indigo" to "primary" to satisfy the TypeScript bouncer */}
                      <Badge variant="primary" dot>{req.type}</Badge>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <button
                        onClick={() => toast.info(`Reason: ${req.reason || 'No reason provided.'}`)}
                        className="p-2 bg-gray-100 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-black text-gray-900">{req.days} Days</div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      {req.status === 'approved' ? (
                        <div className="flex items-center gap-1.5 text-green-600 font-black text-xs uppercase tracking-wider">
                          <CheckCircle className="w-4 h-4" /> Approved
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-500 font-black text-xs uppercase tracking-wider">
                          <XCircle className="w-4 h-4" /> Rejected
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-400">
                      {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                      <Calendar className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-bold">No processed leave activities found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}