'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { Search, RefreshCw, Download } from 'lucide-react'; // Using Lucide for better icons

interface AuditEntry {
  id: string;
  user: string;
  action: string;
  resourceId: string;
  resourceType: 'Attendance' | 'Leave' | 'User' | 'Holiday';
  details: string;
  timestamp: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // Simulate API call to your Express backend
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data: AuditEntry[] = [
        {
          id: 'log_1',
          user: 'Admin User',
          action: 'User Created',
          resourceId: 'user_101',
          resourceType: 'User',
          details: 'Created account for John Doe',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'log_2',
          user: 'Manager Jane',
          action: 'Leave Approved',
          resourceId: 'leave_505',
          resourceType: 'Leave',
          details: 'Approved vacation for Alice Johnson',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'log_3',
          user: 'System',
          action: 'Holiday Added',
          resourceId: 'holiday_99',
          resourceType: 'Holiday',
          details: 'Added "Labor Day" to corporate calendar',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Real-time filtering logic
  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="inline-block animate-spin rounded-full border-4 border-t-indigo-600 border-b-transparent w-12 h-12"></div>
        <p className="mt-4 text-gray-500 font-medium">Syncing audit records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* 1. Page Header with Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Audit Log</h2>
          <p className="text-sm text-gray-500 mt-1">
            Maintain a transparent record of all administrative and system-level actions.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAuditLogs}
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => alert('Exporting logs to CSV...')}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* 2. Search and Filtering Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by user, action, or details..."
            className="block w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2.5 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. The Audit Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{log.user}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${
                        log.resourceType === 'User' ? 'bg-purple-100 text-purple-700' :
                        log.resourceType === 'Leave' ? 'bg-blue-100 text-blue-700' :
                        log.resourceType === 'Attendance' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl mb-2">🔍</span>
                      <p className="font-medium">No activity records match your search.</p>
                      <button 
                        onClick={() => setSearchTerm('')} 
                        className="mt-2 text-indigo-600 hover:underline text-sm"
                      >
                        Clear search
                      </button>
                    </div>
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