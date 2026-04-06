'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

// FIX 1: Define an interface for the export data
interface ExportData {
  period: string;
  generatedAt: string;
  totalEmployees: number;
  totalPresentDays: number;
  totalAbsentDays: number;
  totalHalfDays: number;
  totalLeaveDays: number;
  downloadUrl: string;
}

export default function PayrollExportPage() {
  // FIX 2: Type your state to allow either null or the ExportData object
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    setSelectedPeriod({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }, []);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault(); // FIX 3: Prevent page refresh on form submit
    setExporting(true);
    setExportData(null);
    
    try {
      // Simulate API call to export payroll data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample export data
      setExportData({
        period: `${selectedPeriod.startDate} to ${selectedPeriod.endDate}`,
        generatedAt: new Date().toLocaleString(),
        totalEmployees: 45,
        totalPresentDays: 890,
        totalAbsentDays: 45,
        totalHalfDays: 23,
        totalLeaveDays: 120,
        downloadUrl: '/exports/payroll_april_2026.csv'
      });
    } catch (error) {
      console.error('Failed to export payroll data:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Payroll Export</h2>
        <p className="text-gray-600">
          Export attendance and leave data for payroll processing.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Export Settings</h2>
        
        <form onSubmit={handleExport} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                required
                value={selectedPeriod.startDate}
                onChange={(e) => setSelectedPeriod(prev => ({ ...prev, startDate: e.target.value }))}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                required
                value={selectedPeriod.endDate}
                onChange={(e) => setSelectedPeriod(prev => ({ ...prev, endDate: e.target.value }))}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <Button type="submit" variant="primary" loading={exporting}>
              Export Payroll Data
            </Button>
          </div>
        </form>
      </div>
      
      {exportData && (
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-indigo-600">
          <h2 className="text-xl font-bold mb-4">Export Ready</h2>
          <p className="text-gray-600 mb-4">
            Your payroll export is ready for download.
          </p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs font-bold text-gray-500 uppercase">Period</p>
                <p className="text-sm text-gray-900">{exportData.period}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs font-bold text-gray-500 uppercase">Generated At</p>
                <p className="text-sm text-gray-900">{exportData.generatedAt}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs font-bold text-gray-500 uppercase">Total Employees</p>
                <p className="text-sm text-gray-900">{exportData.totalEmployees}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs font-bold text-gray-500 uppercase">Present Days</p>
                <p className="text-sm text-green-600 font-semibold">{exportData.totalPresentDays}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs font-bold text-gray-500 uppercase">Absent Days</p>
                <p className="text-sm text-red-600 font-semibold">{exportData.totalAbsentDays}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs font-bold text-gray-500 uppercase">Leave Days</p>
                <p className="text-sm text-blue-600 font-semibold">{exportData.totalLeaveDays}</p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <a 
                href={exportData.downloadUrl} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-md flex items-center space-x-2 transition-all shadow-sm"
              >
                <span>📥</span>
                <span>Download CSV</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}