import React from 'react';

export default function LeaveBalance() {
  // Sample data - in a real app, this would come from an API
  const leaveBalances = {
    vacation: { used: 8, total: 20 },
    sick: { used: 2, total: 10 },
    personal: { used: 1, total: 5 },
  };

  const getUsagePercentage = (used: number, total: number) => {
    return total === 0 ? 0 : (used / total) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Leave Balance</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Vacation</span>
            <span className="text-sm font-medium text-gray-900">
              {leaveBalances.vacation.total - leaveBalances.vacation.used} / 
              {leaveBalances.vacation.total} days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${getUsagePercentage(leaveBalances.vacation.used, leaveBalances.vacation.total)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Sick Leave</span>
            <span className="text-sm font-medium text-gray-900">
              {leaveBalances.sick.total - leaveBalances.sick.used} / 
              {leaveBalances.sick.total} days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${getUsagePercentage(leaveBalances.sick.used, leaveBalances.sick.total)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Personal Leave</span>
            <span className="text-sm font-medium text-gray-900">
              {leaveBalances.personal.total - leaveBalances.personal.used} / 
              {leaveBalances.personal.total} days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${getUsagePercentage(leaveBalances.personal.used, leaveBalances.personal.total)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}