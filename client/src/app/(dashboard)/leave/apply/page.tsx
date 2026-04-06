'use client'; // FIX 1: Essential for using useState

import { useState } from 'react';
import Button from '@/components/ui/Button'; // FIX 2: Using our type-safe Button
import LeaveForm from '@/components/leave/LeaveForm';

export default function ApplyLeavePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Apply for Leave</h2>
          <p className="text-sm text-gray-500 mt-1">
            Submit a new request for vacation, sick leave, or other absences.
          </p>
        </div>
        
        <Button
          onClick={() => setOpen(true)}
          variant="primary"
          className="whitespace-nowrap px-8"
        >
          <span className="mr-2">➕</span> New Request
        </Button>
      </div>
      
      {/* Informational Card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
        <h3 className="text-indigo-800 font-bold mb-2">Before you apply:</h3>
        <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
          <li>Ensure you have sufficient leave balance.</li>
          <li>Discuss long absences with your manager in advance.</li>
          <li>Supporting documents may be required for medical leave.</li>
        </ul>
      </div>

      {/* The Form Component */}
      {/* Note: Ensure LeaveForm is set up to handle 'open' and 'onOpenChange' props */}
      <LeaveForm open={open} onOpenChange={setOpen} />
    </div>
  );
}