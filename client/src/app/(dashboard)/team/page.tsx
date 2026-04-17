'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchCurrentUser } from '@/store/authSlice';
import Link from 'next/link';

import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  ArrowLeft,
  SendHorizontal,
  Clock,
  Building2,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  email: string;
  employeeId?: string;
  invitationStatus?: 'none' | 'pending' | 'accepted' | 'rejected';
}

export default function MyTeamPage() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamManager, setTeamManager] = useState<any>(null);
  const [availableEmployees, setAvailableEmployees] = useState<TeamMember[]>([]);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ NEW STATE: Holds the member currently selected for removal
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isAssignedToTeam = !!user?.assignedManager;

  const fetchTeamData = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/team/my-team', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data && data.team) {
        setTeamMembers(data.team);
        setTeamManager(data.manager);
      } else if (Array.isArray(data)) {
        setTeamMembers(data);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/team/unassigned', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAvailableEmployees(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleInvite = async (employeeId: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/team/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ employeeId })
      });
      if (res.ok) {
        toast.success("Invitation sent successfully!");
        fetchDirectory();
      } else {
        toast.error("Invite already pending.");
      }
    } catch (err) { toast.error("Failed to send invite."); }
  };

  const handleCancelInvite = async (employeeId: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/team/invitations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ employeeId })
      });
      if (res.ok) {
        toast.success("Invitation cancelled.");
        fetchDirectory(); // Refresh the list so they can be invited again
      } else {
        toast.error("Failed to cancel invitation.");
      }
    } catch (err) {
      toast.error("Error cancelling invite.");
    }
  };

  const confirmRemoval = async () => {
    if (!memberToRemove) return;

    try {
      const res = await fetch('http://localhost:5000/api/team/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ employeeId: memberToRemove._id, action: 'remove' })
      });
      if (res.ok) {
        toast.success(`${memberToRemove.firstName} removed from team`);
        setMemberToRemove(null); // Close the modal
        dispatch(fetchCurrentUser());
        fetchTeamData();
      }
    } catch (err) { toast.error("Failed to remove member."); }
  };

  useEffect(() => {
    if (token) dispatch(fetchCurrentUser());
  }, [token, dispatch]);

  useEffect(() => {
    if (token) {
      if (isManager || isAssignedToTeam) {
        fetchTeamData();
      } else {
        setLoading(false);
      }
    }
  }, [token, isManager, isAssignedToTeam, fetchTeamData]);

  if (loading) {
    return <div className="p-20 text-center animate-pulse font-bold text-gray-400">SYNCING HUB...</div>;
  }

  // --- RENDER EMPLOYEE VIEW ---
  if (!isManager) {
    if (!isAssignedToTeam) {
      return (
        <div className="max-w-4xl mx-auto space-y-8 p-10 text-center mt-12">
          <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-400 mx-auto mb-8 border-4 border-white shadow-xl shadow-gray-100/50">
            <UserX className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Not Assigned to a Team</h2>
          <p className="text-gray-500 font-medium text-lg max-w-md mx-auto leading-relaxed">
            You are not currently part of a team. Please check your{' '}
            <Link href="/team/invitations" className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline transition-colors">
              Team Invitations
            </Link>{' '}
            tab or contact your department manager.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-12 p-4 max-w-7xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 inline-flex items-center gap-6 pr-16">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-indigo-200">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-1">Team Leader</p>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {teamManager ? `${teamManager.firstName} ${teamManager.lastName}` : 'Loading...'}
            </h2>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">
              {teamManager?.department || user?.department} Department
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3 pl-2">
            Team Members
            <span className="bg-gray-100 text-gray-500 text-sm px-3 py-1 rounded-full">{teamMembers.length + 1}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[2.5rem] p-8 shadow-sm text-center flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-sm">
                You
              </div>
              <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-2xl font-black text-indigo-500 mb-4 border-4 border-indigo-50 shadow-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <h3 className="font-black text-gray-900 text-lg">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-[10px] font-black text-indigo-500 mt-2 uppercase tracking-[0.2em]">
                {user?.department || 'General'} • {user?.role || 'Employee'}
              </p>
            </div>

            {teamMembers.map((member) => (
              <div key={member._id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm text-center flex flex-col items-center hover:shadow-xl transition-all">
                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-2xl font-black text-gray-400 mb-4 border-4 border-white shadow-inner">
                  {member.firstName?.[0]}{member.lastName?.[0]}
                </div>
                <h3 className="font-black text-gray-900 text-lg">{member.firstName} {member.lastName}</h3>
                <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-[0.2em]">
                  {member.department || 'General'} • {member.role || 'Employee'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MANAGER VIEW ---
  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            {isAddingMode ? 'Recruit Talent' : 'My Squad'}
          </h2>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            {isAddingMode ? 'Browse unassigned members to invite.' : `Managing ${teamMembers.length} active members.`}
          </p>
        </div>
        {!isAddingMode ? (
          <Button onClick={() => { setIsAddingMode(true); fetchDirectory(); }} className="rounded-2xl px-8 py-4 flex items-center gap-2 shadow-xl shadow-indigo-100">
            <UserPlus className="w-5 h-5" /> Find Talent
          </Button>
        ) : (
          <Button onClick={() => setIsAddingMode(false)} variant="outline" className="rounded-2xl px-8 py-4">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Team
          </Button>
        )}
      </div>

      {isAddingMode && (
        <div className="relative group max-w-xl mx-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text" placeholder="Search directory..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {!isAddingMode && teamMembers.map((member) => (
          <div key={member._id} className="group bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm hover:shadow-xl transition-all duration-300 text-center relative">

            {/* ✅ FIXED BUTTON: Now it sets the state instead of removing immediately */}
            <button
              onClick={() => setMemberToRemove(member)}
              className="absolute top-4 right-4 p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm group/btn"
              title="Remove member"
            >
              <UserMinus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            </button>

            <div className="w-24 h-24 mx-auto mb-6 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-3xl font-black text-indigo-200 border-4 border-white shadow-inner">
              {member.firstName?.[0]}{member.lastName?.[0]}
            </div>
            <h3 className="font-black text-gray-900 text-xl">{member.firstName} {member.lastName}</h3>
            <p className="text-xs font-black text-indigo-600 mt-2 uppercase tracking-[0.2em]">{member.department || 'GENERAL'}</p>
          </div>
        ))}

        {isAddingMode && availableEmployees.filter(emp => `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
          <div key={emp._id} className="bg-white border-2 border-gray-300 shadow-lg shadow-gray-200/60 rounded-[3rem] p-8 text-center transition-all hover:shadow-xl hover:border-indigo-400 group relative overflow-hidden">
            {emp.invitationStatus === 'pending' && (
              <div className="absolute top-0 left-0 w-full bg-amber-500 text-white py-1 text-[10px] font-black uppercase tracking-widest">
                Pending Decision
              </div>
            )}
            <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-3xl flex items-center justify-center text-xl font-black text-indigo-600">
              {emp.firstName?.[0]}
            </div>
            <h3 className="font-black text-gray-900">{emp.firstName} {emp.lastName}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{emp.department}</p>

            {/* ✅ UPDATED BUTTON LOGIC: Swaps between Send and Cancel */}
            {emp.invitationStatus === 'pending' ? (
              <button
                onClick={() => handleCancelInvite(emp._id)}
                className="w-full rounded-2xl py-3 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm"
              >
                <UserX className="w-3 h-3" /> Cancel Invite
              </button>
            ) : (
              <button
                onClick={() => handleInvite(emp._id)}
                className="w-full rounded-2xl py-3 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                <SendHorizontal className="w-3 h-3" /> Send Invite
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ✅ NEW CONFIRMATION MODAL OVERLAY */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">

            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6 border-4 border-white shadow-sm">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Remove Member?</h3>

            <p className="text-gray-500 font-medium mb-10 leading-relaxed">
              Are you sure you want to remove <strong className="text-gray-900">{memberToRemove.firstName} {memberToRemove.lastName}</strong> from your team? They will be moved back to the unassigned pool.
            </p>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setMemberToRemove(null)}
                className="rounded-2xl px-6 py-4 font-bold border-2"
              >
                No, Keep Them
              </Button>
              <Button
                variant="primary"
                onClick={confirmRemoval}
                className="rounded-2xl px-8 py-4 font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 border-none"
              >
                Yes, Remove
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}