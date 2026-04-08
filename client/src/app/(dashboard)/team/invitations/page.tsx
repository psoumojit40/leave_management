'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchCurrentUser } from '@/store/authSlice';
import { Check, X, Bell, Inbox } from 'lucide-react';
import { toast } from 'sonner';

interface Invitation {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    department: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

export default function TeamInvitationsPage() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Invitations ---
  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/team/invitations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setInvitations(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // --- Respond Action ---
  const handleInviteResponse = async (invitationId: string, action: 'accepted' | 'rejected') => {
    try {
      const res = await fetch('http://localhost:5000/api/team/invitations/respond', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ invitationId, action })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed.");

      toast.success(`Invitation ${action} successfully.`);
      
      // ✅ THE BULLETPROOF FIX: Instantly sync Redux with the fresh database profile!
      if (action === 'accepted') {
        await dispatch(fetchCurrentUser());
      }

      fetchInvitations();
    } catch (err: any) { 
      toast.error(err.message || "Action failed."); 
    }
  };

  useEffect(() => {
    if (token) fetchInvitations();
  }, [token, fetchInvitations]);

  if (loading) {
    return <div className="p-20 text-center animate-pulse font-bold text-gray-400">SYNCING INBOX...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm flex items-center justify-between overflow-hidden relative">
         <div className="absolute top-0 right-0 p-10 opacity-5">
           <Bell className="w-32 h-32" />
         </div>
         <div className="relative z-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Team Invitations</h2>
            <p className="text-gray-500 font-medium italic">Review invitations from department managers.</p>
         </div>
      </div>

      {invitations.length > 0 ? (
        <div className="grid gap-6">
          {invitations.map((invite) => (
            <div key={invite._id} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black">
                  {invite.sender?.firstName?.[0] || '?'}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{invite.sender?.firstName} {invite.sender?.lastName}</h3>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em]">{invite.sender?.department} Dept</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => handleInviteResponse(invite._id, 'rejected')}
                  className="flex-1 md:flex-none p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <X className="w-6 h-6 mx-auto" />
                </button>
                <button 
                  onClick={() => handleInviteResponse(invite._id, 'accepted')}
                  className="flex-1 md:flex-none px-10 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> Accept Join
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 py-32 text-center">
          <Inbox className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Your inbox is clear</p>
        </div>
      )}
    </div>
  );
}