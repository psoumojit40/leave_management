'use client'; // FIX 1: Must be at the very top for hooks to work

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

// FIX 2: Define a proper Interface so TypeScript stops guessing
interface Holiday {
  id: number;
  name: string;
  date: string;
  type: 'Public Holiday' | 'Company Holiday' | 'Observance';
}

export default function HolidaysPage() {
  // FIX 3: Add Types to your state declarations
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data: Holiday[] = [
          { id: 1, name: 'New Year\'s Day', date: '2026-01-01', type: 'Public Holiday' },
          { id: 2, name: 'Independence Day', date: '2026-07-04', type: 'Public Holiday' },
          { id: 3, name: 'Christmas Day', date: '2026-12-25', type: 'Public Holiday' },
          { id: 4, name: 'Company Anniversary', date: '2026-06-15', type: 'Company Holiday' },
        ];
        setHolidays(data);
      } catch (error) {
        console.error('Failed to fetch holidays:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const handleCreateHoliday = () => {
    setSelectedHoliday({
      id: 0,
      name: '',
      date: '',
      type: 'Public Holiday'
    });
  };

  const handleEditHoliday = (holiday: Holiday) => {
    setSelectedHoliday({ ...holiday });
  };

  const handleDeleteHoliday = async (holidayId: number) => {
    console.log(`Deleting holiday ${holidayId}`);
    // FIX 4: Use 'prev' correctly inside the filter
    setHolidays(prev => prev.filter(h => h.id !== holidayId));
  };

  const handleSaveHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHoliday) return;

    console.log('Saving holiday:', selectedHoliday);
    
    if (selectedHoliday.id === 0) {
      setHolidays(prev => [...prev, { ...selectedHoliday, id: Date.now() }]);
    } else {
      setHolidays(prev => prev.map(h => 
        h.id === selectedHoliday.id ? selectedHoliday : h
      ));
    }
    
    setSelectedHoliday(null);
  };

  const handleCancelHoliday = () => {
    setSelectedHoliday(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full border-4 border-t-indigo-600 border-b-transparent w-12 h-12"></div>
        <p className="mt-4">Loading holidays...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Holiday Management</h2>
          <Button onClick={handleCreateHoliday}>
            Add Holiday
          </Button>
        </div>
        <p className="text-gray-600">
          Manage company holidays and observances.
        </p>
      </div>
      
      {selectedHoliday && (
        <div className="bg-white rounded-lg shadow p-6 border-2 border-indigo-100">
          <h2 className="text-xl font-bold mb-4">
            {selectedHoliday.id === 0 ? 'Create New Holiday' : 'Edit Holiday'}
          </h2>
          
          <form onSubmit={handleSaveHoliday} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Holiday Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={selectedHoliday.name}
                onChange={(e) => setSelectedHoliday({ ...selectedHoliday, name: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                id="date"
                type="date"
                required
                value={selectedHoliday.date}
                onChange={(e) => setSelectedHoliday({ ...selectedHoliday, date: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Holiday Type
              </label>
              <select
                id="type"
                required
                value={selectedHoliday.type}
                onChange={(e) => setSelectedHoliday({ ...selectedHoliday, type: e.target.value as any })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              >
                <option value="Public Holiday">Public Holiday</option>
                <option value="Company Holiday">Company Holiday</option>
                <option value="Observance">Observance</option>
              </select>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button type="button" onClick={handleCancelHoliday}>
                Cancel
              </Button>
              <Button type="submit">
                Save Holiday
              </Button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Holiday List</h2>
        
        {holidays.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{holiday.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{holiday.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        holiday.type === 'Public Holiday' ? 'bg-blue-100 text-blue-800' :
                        holiday.type === 'Company Holiday' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {holiday.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditHoliday(holiday)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No holidays found.</p>
          </div>
        )}
      </div>
    </div>
  );
}