'use client'; // FIX 1: Required for state and file handling

import React, { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import { FileUp, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImportCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to manually clear the file input field
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Basic validation
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a valid CSV file.');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Simulate API call to your Express backend (e.g., /api/attendance/import)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    } catch (err) {
      setError('Failed to import CSV file. Please check the format and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <FileUp className="w-5 h-5 mr-2 text-indigo-600" />
          Bulk Import Attendance
        </h2>
      </div>

      <div className="p-6">
        <p className="text-sm text-gray-500 mb-6">
          Upload a CSV file to update attendance records for multiple employees at once. 
          Ensure your file matches the column format shown below.
        </p>
        
        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 flex items-center text-green-700">
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">Attendance records imported successfully!</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors text-center">
            <label htmlFor="csvFile" className="cursor-pointer block">
              <div className="flex flex-col items-center">
                <FileUp className="w-10 h-10 text-gray-400 mb-3" />
                <span className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                  Click to upload
                </span>
                <span className="text-xs text-gray-400 mt-1">or drag and drop CSV file here</span>
              </div>
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            
            {file && (
              <div className="mt-4 px-3 py-1 bg-white border border-indigo-100 rounded-full inline-flex items-center text-xs font-bold text-indigo-700 shadow-sm">
                📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => alert('Downloading template...')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              loading={loading}
              className="w-full sm:w-auto px-10"
              disabled={!file}
            >
              Start Import
            </Button>
          </div>
        </form>
        
        {/* Instructions/Format Example */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Required CSV Structure
          </h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <code className="text-indigo-300 text-xs leading-relaxed">
              employee_id, date, status, hours_worked<br />
              E1001, 2026-04-01, present, 8<br />
              E1002, 2026-04-01, absent, 0<br />
              E1003, 2026-04-01, half-day, 4
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}