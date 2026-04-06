'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
}

export default function SettingsPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    department: '', 
    role: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const hasHighAccess = user?.role === 'admin' || user?.role === 'manager';
  const isAdmin = user?.role === 'admin'; // ✅ Helper to check for Admin role

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || '', 
        role: user.role || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full border-4 border-t-indigo-600 border-b-transparent w-12 h-12"></div>
        <p className="mt-4 text-gray-600 font-medium tracking-wide">Syncing account data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Top Section: Names and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name</label>
              <input
                id="firstName"
                type="text"
                required
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm transition-all"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name</label>
              <input
                id="lastName"
                type="text"
                required
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm transition-all"
              />
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm transition-all bg-white"
              />
            </div>
          </div>

          {/* Bottom Section: Organization Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
            
            {/* ✅ CONDITIONALLY REMOVED FOR ADMIN */}
            {!isAdmin && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Department</label>
                <input
                  type="text"
                  disabled={!hasHighAccess}
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className={`block w-full rounded-md border px-4 py-2 sm:text-sm transition-all ${
                    hasHighAccess ? "border-gray-300 bg-white text-gray-900" : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
                />
              </div>
            )}
            
            {/* Designation / Role - Expands to full width if Admin */}
            <div className={`space-y-1 ${isAdmin ? 'md:col-span-2' : ''}`}>
              <label className="text-sm font-semibold text-gray-700">Designation / Role</label>
              <input
                type="text"
                disabled
                value={profile.role.toUpperCase()}
                className="block w-full rounded-md border border-gray-100 bg-gray-50 px-4 py-2 text-gray-400 cursor-not-allowed uppercase sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end">
          <Button type="submit" variant="primary" loading={saving} className="px-10">
            Save Changes
          </Button>
        </div>
      </form>

      <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6">
        <h3 className="text-red-800 font-bold mb-1">Privacy & Security</h3>
        <p className="text-sm text-red-600 mb-4">Manage your password and security settings.</p>
        <Button variant="outline" className="text-red-700 border-red-200 hover:bg-red-100">
          Reset Password
        </Button>
      </div>
    </div>
  );
}