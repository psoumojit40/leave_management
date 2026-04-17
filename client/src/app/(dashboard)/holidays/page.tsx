'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: 'Public' | 'Company' | 'Observance';
  duration: number;
}

export default function HolidayManagement() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // ✅ Added endDate to state for two-way binding
  const [formData, setFormData] = useState({ name: '', date: '', endDate: '', type: 'Public', duration: 1 });

  const canManage = user?.role === 'manager' || user?.role === 'admin';

  const fetchHolidays = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/holidays', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHolidays(data);
    } catch (error) {
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchHolidays(); }, [token]);

  // --- 📅 DATE MATH HELPERS (Timezone Safe) ---
  const calculateEndDate = (startStr: string, days: number) => {
    if (!startStr) return '';
    const [year, month, day] = startStr.split('-');
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    d.setDate(d.getDate() + days - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayStr}`;
  };

  const calculateDuration = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 1;
    const [sy, sm, sd] = startStr.split('-');
    const [ey, em, ed] = endStr.split('-');
    const s = new Date(Number(sy), Number(sm) - 1, Number(sd));
    const e = new Date(Number(ey), Number(em) - 1, Number(ed));
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  // --- 🔄 TWO-WAY BINDING HANDLERS ---
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value) || 1;
    setFormData(prev => ({
      ...prev,
      duration: newDuration,
      endDate: calculateEndDate(prev.date, newDuration)
    }));
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      date: newDate,
      endDate: calculateEndDate(newDate, prev.duration)
    }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    const newDuration = calculateDuration(formData.date, newEndDate);
    setFormData(prev => ({
      ...prev,
      endDate: newEndDate,
      duration: newDuration
    }));
  };

  // --- ACTION HANDLERS ---
  const handleEditClick = (holiday: Holiday) => {
    setEditingId(holiday._id);
    const startDate = holiday.date.split('T')[0];
    const duration = holiday.duration || 1;
    setFormData({ 
        name: holiday.name, 
        date: startDate, 
        endDate: calculateEndDate(startDate, duration),
        type: holiday.type,
        duration: duration 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `http://localhost:5000/api/holidays/${editingId}` : 'http://localhost:5000/api/holidays';
    const method = editingId ? 'PUT' : 'POST';

    // We don't need to send the 'endDate' to the database, just the duration and start date!
    const payload = {
      name: formData.name,
      date: formData.date,
      type: formData.type,
      duration: formData.duration
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not save holiday");
      
      toast.success(editingId ? "Holiday updated!" : "Holiday added!");
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', date: '', endDate: '', type: 'Public', duration: 1 }); // Reset
      fetchHolidays();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this holiday?")) return;
    try {
      await fetch(`http://localhost:5000/api/holidays/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setHolidays(holidays.filter(h => h._id !== id));
      toast.success("Holiday deleted");
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTypeStyles = (type: string) => {
    switch(type) {
      case 'Public': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Company': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
             {canManage ? "Holiday Management" : "Company Holidays"}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {canManage ? "Add, update, or remove company holidays." : "Upcoming company holidays and observances."}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => { setEditingId(null); setFormData({ name: '', date: '', endDate: '', type: 'Public', duration: 1 }); setIsModalOpen(true); }} variant="primary" className="rounded-xl px-6">
            <Plus className="w-4 h-4 mr-2" /> Add Holiday
          </Button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-lg font-black text-gray-900">Scheduled Holidays</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Holiday Name</th>
                <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Duration</th>
                {canManage && <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {holidays.map((h) => (
                <tr key={h._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5 text-base font-bold text-gray-900">{h.name}</td>
                  <td className="px-8 py-5 text-[15px] font-medium text-gray-600">{formatDate(h.date)}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeStyles(h.type)}`}>
                      {h.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[15px] font-medium text-gray-600">
                    {h.duration} Day{h.duration > 1 ? 's' : ''}
                  </td>
                  {canManage && (
                    <td className="px-8 py-5 text-right space-x-2">
                      <button onClick={() => handleEditClick(h)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(h._id)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canManage && (
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Holiday" : "New Holiday"}>
          <form onSubmit={handleSubmit} className="space-y-6 p-2">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">Holiday Name</label>
              <input 
                type="text" required value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none focus:border-indigo-500"
                placeholder="e.g. Durga Puja"
              />
            </div>
            
            {/* ✅ NEW DYNAMIC DATE UI WITH TWO-WAY BINDING */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2">Duration (Days)</label>
                <input 
                  type="number" min="1" required 
                  value={formData.duration}
                  onChange={handleDurationChange}
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className={`grid gap-4 transition-all ${formData.duration > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">
                    {formData.duration > 1 ? "Start Date" : "Date"}
                  </label>
                  <input 
                    type="date" required 
                    value={formData.date}
                    onChange={handleStartDateChange}
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                
                {/* 🎯 Real Date Input that calculates backwards to update Duration! */}
                {formData.duration > 1 && (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <label className="block text-sm font-black text-gray-900 mb-2">End Date</label>
                    <input 
                      type="date" required 
                      value={formData.endDate}
                      min={formData.date} // Stops them from picking a past date
                      onChange={handleEndDateChange}
                      className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none focus:border-indigo-500 transition-all cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none cursor-pointer"
              >
                <option value="Public">Public Holiday</option>
                <option value="Company">Company Holiday</option>
                <option value="Observance">Observance</option>
              </select>
            </div>

            <Button type="submit" variant="primary" className="w-full py-4 rounded-xl font-bold shadow-lg shadow-indigo-100">
              {editingId ? "Save Changes" : "Create Holiday"}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}