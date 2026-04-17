'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Building2, Mail, Briefcase, CalendarClock } from 'lucide-react';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';

interface DeptMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
}

export default function MyDepartmentPage() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [members, setMembers] = useState<DeptMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartment = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/team/department-members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchDepartment();
  }, [token, fetchDepartment]);

  if (loading) {
    return <div className="p-20 text-center animate-pulse font-bold text-gray-400">LOADING DEPARTMENT...</div>;
  }

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-xl shadow-indigo-100">
          <Building2 className="w-10 h-10" />
        </div>
        <div>
          <p className="text-sm font-bold text-indigo-500 uppercase tracking-[0.2em] mb-1">Department Overview</p>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            {user?.department || 'General'}
          </h2>
          <p className="text-gray-500 font-medium mt-2">
            Viewing all <b className="text-gray-900">{members.length}</b> personnel operating within this department.
          </p>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member._id} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex flex-col hover:shadow-xl transition-all relative overflow-hidden group">
            
            {/* Tag if the user is a manager */}
            {member.role === 'manager' && (
               <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-sm">
                 Manager
               </div>
            )}

            <div className="flex items-center gap-5 mb-6">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black shadow-inner border-2 border-white ${member.role === 'manager' ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-400'}`}>
                {member.firstName?.[0]}{member.lastName?.[0]}
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-xl">{member.firstName} {member.lastName}</h3>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                  {member.role}
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-500 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <Mail className="w-4 h-4 text-gray-400" />
                {member.email}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}