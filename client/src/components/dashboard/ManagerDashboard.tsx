'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchLeaveSettings } from '@/store/leaveSlice'; 
import Link from 'next/link';
import { 
  Settings, 
  Plus, 
  Users, 
  CheckCircle, 
  Check, 
  X, 
  Trash2, 
  Info 
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

const COLOR_PALETTE = [
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Amber', value: 'bg-amber-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Emerald', value: 'bg-emerald-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Violet', value: 'bg-violet-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Fuchsia', value: 'bg-fuchsia-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Rose', value: 'bg-rose-500' },
];

export default function ManagerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  
  const { token } = useSelector((state: RootState) => state.auth);
  const { settings } = useSelector((state: RootState) => state.leave); 
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);

  const [newCatName, setNewCatName] = useState('');
  const [newCatDays, setNewCatDays] = useState('');
  const [newCatColor, setNewCatColor] = useState('bg-indigo-500');

  // --- Data Fetching ---
  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/leave?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Removed the .slice(0,5) so we can utilize the new scrollbar for all requests
      setPendingRequests(data);
    } catch (error) {
      console.error("Failed to fetch pending requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPending();
  }, [token]);

  // --- Handlers: Approve / Reject ---
  const handleApprove = async (id: string, employeeName: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/leave/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to approve');
      toast.success(`Leave request for ${employeeName} approved!`);
      fetchPending();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async (id: string, employeeName: string) => {
    const comment = window.prompt("Reason for rejection (optional):");
    if (comment === null) return; // User cancelled prompt

    try {
      const res = await fetch(`http://localhost:5000/api/leave/${id}/reject`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ managerComments: comment })
      });
      if (!res.ok) throw new Error('Failed to reject');
      toast.error(`Leave request for ${employeeName} rejected.`);
      fetchPending();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // --- Handlers: Leave Settings ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/leave-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName, defaultDays: Number(newCatDays), color: newCatColor })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('New leave category created!');
      setIsCategoryModalOpen(false);
      setNewCatName(''); setNewCatDays('');
      dispatch(fetchLeaveSettings()); 
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category');
    }
  };

  const handleSaveQuotas = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const inputs = Array.from(form.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
    const updatedQuotas = inputs.map(input => ({ name: input.name, defaultDays: Number(input.value) }));

    try {
      const res = await fetch('http://localhost:5000/api/leave-settings/bulk-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quotas: updatedQuotas })
      });
      if (!res.ok) throw new Error('Failed to update quotas');
      toast.success('Department quotas updated successfully!');
      setIsQuotaModalOpen(false);
      dispatch(fetchLeaveSettings()); 
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the "${name}" category?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/leave-settings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success(`Category "${name}" deleted.`);
      dispatch(fetchLeaveSettings());
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Manage Leave Policies Card */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Settings className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Team Settings</p>
              <h2 className="text-2xl font-black text-gray-900">Manage Leave Policies</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">Configure leave quotas and categories.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsCategoryModalOpen(true)} variant="outline" className="rounded-xl font-bold px-6 border-2">
              <Plus className="w-4 h-4 mr-2" /> New Category
            </Button>
            <Button onClick={() => setIsQuotaModalOpen(true)} variant="primary" className="rounded-xl font-bold px-6 shadow-lg shadow-indigo-100">
              Edit Quotas
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Pending Requests Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Pending Team Requests</h2>
          </div>
          <Link href="/approvals" className="text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
            Manage All
          </Link>
        </div>

        {/* ✅ Container with Scroll Bar */}
        <div className="overflow-x-auto max-h-[450px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Employee</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Type</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white text-center">Reason</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Duration</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Applied On</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center"><div className="h-10 bg-gray-50 animate-pulse rounded-lg" /></td></tr>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((req: any) => (
                  <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{req.employeeId?.firstName} {req.employeeId?.lastName}</div>
                      <div className="text-xs font-medium text-gray-400">{req.employeeId?.department}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <Badge variant="warning" dot>{req.type}</Badge>
                    </td>
                    {/* ✅ New Reason Column with Info Button */}
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <button 
                        onClick={() => toast.info(`Reason: ${req.reason || 'No reason provided'}`)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-indigo-600 transition-all"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{req.days} Day{req.days > 1 ? 's' : ''}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-400">
                      {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    {/* ✅ Action Buttons Column */}
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprove(req._id, req.employeeId?.firstName)}
                          className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Approve Request"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(req._id, req.employeeId?.firstName)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Reject Request"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-500">All caught up! No pending requests.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔴 MODAL 1: Create New Category */}
      <Modal open={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Create Leave Category">
        <form onSubmit={handleCreateCategory} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">Category Name</label>
            <input 
              type="text" required value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g., Sabbatical Leave" 
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-medium py-3 px-4 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">Default Days</label>
              <input 
                type="number" required min="1" value={newCatDays} onChange={(e) => setNewCatDays(e.target.value)}
                placeholder="0" className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-medium py-3 px-4 rounded-xl outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">Theme Color</label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color.name} type="button" onClick={() => setNewCatColor(color.value)}
                    className={`w-8 h-8 rounded-full shadow-sm transition-transform hover:scale-110 flex items-center justify-center ${color.value} ${newCatColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-80'}`}
                  >
                    {newCatColor === color.value && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button type="submit" variant="primary" className="w-full rounded-xl py-4 font-bold shadow-lg shadow-indigo-100">Create Category</Button>
        </form>
      </Modal>

      {/* 🔴 MODAL 2: Edit Quotas */}
      <Modal open={isQuotaModalOpen} onClose={() => setIsQuotaModalOpen(false)} title="Edit Department Quotas">
        <form onSubmit={handleSaveQuotas} className="space-y-6">
          <p className="text-sm font-medium text-gray-500 mb-4">Adjust quotas for your department.</p>
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {settings.map((leave: any) => (
              <div key={leave._id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl group">
                <span className="font-bold text-gray-700">{leave.name}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" name={leave.name} defaultValue={leave.defaultDays}
                      className="w-16 bg-white border border-gray-200 text-gray-900 font-black py-2 px-2 rounded-lg text-center outline-none focus:border-indigo-500 transition-all"
                    />
                    <span className="text-xs font-bold text-gray-400 uppercase">Days</span>
                  </div>
                  <button
                    type="button" onClick={() => handleDeleteCategory(leave._id, leave.name)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100">
            <Button type="submit" variant="primary" className="w-full rounded-xl py-4 font-bold shadow-lg shadow-indigo-100">Save Changes</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}