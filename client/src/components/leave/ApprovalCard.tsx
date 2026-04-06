import React from 'react';

interface ApprovalCardProps {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedOn: string;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
  requestId: number;
}

export default function ApprovalCard({
  employeeName,
  leaveType,
  startDate,
  endDate,
  days,
  reason,
  appliedOn,
  onApprove,
  onReject,
  requestId,
}: ApprovalCardProps) {
  const handleApprove = () => onApprove(requestId);
  const handleReject = () => onReject(requestId);

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-gray-900">{employeeName}</h3>
          <p className="text-sm text-gray-500">{leaveType}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">Applied</p>
          <p className="text-sm">{appliedOn}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-500">Dates</p>
        <p className="mt-1 text-lg font-medium text-gray-900">
          {startDate} to {endDate}
        </p>
        <p className="text-xs text-gray-400 mt-1">{days} days</p>
      </div>
      
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-500">Reason</p>
        <p className="mt-1 text-gray-700">{reason}</p>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleApprove}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
        >
          Approve
        </button>
        <button
          onClick={handleReject}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}