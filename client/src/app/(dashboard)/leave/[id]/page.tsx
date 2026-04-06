'use client'; // FIX 1: Directive needed for hooks

import { useEffect, useState, use } from 'react'; // Added 'use' for params
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button'; // FIX 2: Using your custom button

// FIX 3: Define the LeaveRequest interface
interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Cancelled';
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
}

// FIX 4: Correct typing for Next.js dynamic params
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LeaveDetailPage({ params }: PageProps) {
  // Unwrap the params promise
  const { id } = use(params);
  
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      try {
        // Simulate API call using the 'id' from params
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLeaveRequest({
          id: id,
          type: 'Vacation',
          startDate: '2026-04-10',
          endDate: '2026-04-15',
          reason: 'Family vacation',
          status: 'Approved',
          appliedOn: '2026-04-01',
          approvedBy: 'John Manager',
          approvedOn: '2026-04-02',
        });
      } catch (error) {
        console.error('Failed to fetch leave request:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full border-4 border-t-indigo-600 border-b-transparent w-12 h-12"></div>
        <p className="mt-4 text-gray-600">Loading leave details...</p>
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Leave request not found.</p>
        <Button 
          onClick={() => router.back()}
          className="mt-6"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Leave Request Details</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            leaveRequest.status === 'Approved' ? 'bg-green-100 text-green-700' : 
            leaveRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'
          }`}>
            {leaveRequest.status}
          </span>
        </div>
        
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Leave Type</p>
              <p className="text-lg font-semibold text-gray-900">{leaveRequest.type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Request ID</p>
              <p className="text-sm font-mono text-gray-600">{leaveRequest.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-50">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</p>
              <p className="text-lg font-medium text-gray-900">{leaveRequest.startDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">End Date</p>
              <p className="text-lg font-medium text-gray-900">{leaveRequest.endDate}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reason for Leave</p>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg italic">"{leaveRequest.reason}"</p>
          </div>
          
          {leaveRequest.status === 'Approved' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-indigo-50 bg-indigo-50/30 p-4 rounded-lg">
              <div className="space-y-1">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Approved By</p>
                <p className="text-md font-semibold text-gray-900">{leaveRequest.approvedBy}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Approved On</p>
                <p className="text-md font-semibold text-gray-900">{leaveRequest.approvedOn}</p>
              </div>
            </div>
          )}
          
          <div className="pt-4 text-right">
            <p className="text-xs text-gray-400">Application submitted on {leaveRequest.appliedOn}</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <Button 
          onClick={() => router.back()}
          variant="secondary"
        >
          Back to History
        </Button>
        
        {leaveRequest.status === 'Pending' && (
          <>
            <Button variant="outline">
              Edit Request
            </Button>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              Cancel Request
            </Button>
          </>
        )}
      </div>
    </div>
  );
}