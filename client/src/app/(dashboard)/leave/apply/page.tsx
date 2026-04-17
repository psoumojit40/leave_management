'use client';

import LeaveForm from '@/components/leave/LeaveForm'; // ✅ Now works without props!
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ApplyLeavePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="group flex items-center text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Apply for Leave</h1>
          <p className="text-gray-500 font-medium mt-1">
            Request your time off. Your balance will be updated once approved.
          </p>
        </div>

        {/* ✅ This now works perfectly without needing open/onOpenChange */}
        <LeaveForm />
      </div>
    </div>
  );
}