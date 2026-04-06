'use client';

import { PieChart, Calendar, Umbrella, Plus } from 'lucide-react';
import { getLeaveTypeColorClass, getLeaveTypeDisplayName } from '@/utils/dateUtils';

interface LeaveBalanceCardProps {
  type: string;
  used: number;
  total: number;
}

export default function LeaveBalanceCard({ type, used, total }: LeaveBalanceCardProps) {
  const remaining = total - used;
  const percentage = Math.round((used / total) * 100);
  const colorClass = getLeaveTypeColorClass(type);
  const displayName = getLeaveTypeDisplayName(type);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10`}>
          {type === 'vacation' && <Umbrella className="w-5 h-5" />}
          {type === 'sick' && <Calendar className="w-5 h-5" />}
          {type === 'personal' && <PieChart className="w-5 h-5" />}
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {total} Days Total
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-tight mb-1">
          {displayName}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-gray-900">{remaining}</span>
          <span className="text-sm font-medium text-gray-400">days left</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${colorClass.split(' ')[0]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="text-[10px] font-bold text-gray-400 uppercase">
        {used} days taken • {percentage}% of quota
      </p>
    </div>
  );
}