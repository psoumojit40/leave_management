import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import DateRangePicker from '@/components/ui/DateRangePicker';

interface LeaveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LeaveForm({ open, onOpenChange }: LeaveFormProps) {
  const [leaveType, setLeaveType] = useState('vacation');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      setLoading(false);
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      setLoading(false);
      return;
    }
    
    if (!reason.trim()) {
      setError('Please provide a reason for your leave');
      setLoading(false);
      return;
    }
    
    try {
      // Simulate API call to submit leave request
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      // Close form after successful submission
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      setError('Failed to submit leave request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title="Apply for Leave">
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p>Leave request submitted successfully!</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">
            Leave Type
          </label>
          <select
            id="leaveType"
            required
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="bereavement">Bereavement Leave</option>
            <option value="maternity">Maternity Leave</option>
            <option value="paternity">Paternity Leave</option>
            <option value="jury">Jury Duty</option>
            <option value="military">Military Leave</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <label htmlFor="halfDay" className="flex items-center text-sm font-medium text-gray-700 mr-4">
            <input
              id="halfDay"
              type="checkbox"
              checked={halfDay}
              onChange={(e) => setHalfDay(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            Half Day
          </label>
          {!halfDay && (
            <>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1 mr-4">
                Start Date
              </label>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
                className="flex-1 min-w-0"
              />
            </>
          )}
        </div>
        
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <textarea
            id="reason"
            rows={4}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Button type="button" onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}