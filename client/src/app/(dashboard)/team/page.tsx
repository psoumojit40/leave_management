'use client'; // FIX 1: Directive for hooks

import { useEffect, useState } from 'react';

// FIX 2: Define the TeamMember interface
interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  avatar: string;
  status?: 'Available' | 'On Leave' | 'Remote'; // Added for a more realistic UI
}

export default function TeamPage() {
  // FIX 3: Type the state correctly
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data: TeamMember[] = [
          { id: 1, name: 'Alice Johnson', role: 'Lead Developer', department: 'Engineering', avatar: '/avatars/alice.jpg', status: 'Available' },
          { id: 2, name: 'Bob Smith', role: 'Project Manager', department: 'Engineering', avatar: '/avatars/bob.jpg', status: 'On Leave' },
          { id: 3, name: 'Carol Davis', role: 'UI/UX Designer', department: 'Design', avatar: '/avatars/carol.jpg', status: 'Available' },
          { id: 4, name: 'David Wilson', role: 'HR Specialist', department: 'Human Resources', avatar: '/avatars/david.jpg', status: 'Remote' },
        ];
        setTeamMembers(data);
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full border-4 border-t-indigo-600 border-b-transparent w-12 h-12"></div>
        <p className="mt-4 text-gray-600 font-medium tracking-wide">Syncing team data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Team Overview</h2>
        <p className="text-sm text-gray-500 mt-1">
          Monitor your team’s roles, departments, and current availability.
        </p>
      </div>
      
      {teamMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              {/* Avatar with fallback background */}
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-inner">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-indigo-300">
                      {member.name.charAt(0)}
                    </span>
                  )}
                </div>
                {/* Small online/offline dot */}
                <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
                  member.status === 'Available' ? 'bg-green-500' : 
                  member.status === 'On Leave' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
              </div>

              <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
              <p className="text-sm font-medium text-indigo-600 mb-1">{member.role}</p>
              <p className="text-xs text-gray-400 uppercase tracking-tighter mb-4">{member.department}</p>
              
              <div className="pt-4 border-t border-gray-50">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  member.status === 'Available' ? 'bg-green-50 text-green-700' : 
                  member.status === 'On Leave' ? 'bg-red-50 text-red-700' : 
                  'bg-blue-50 text-blue-700'
                }`}>
                  {member.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 py-20 text-center">
          <p className="text-gray-500 font-medium">No team members found.</p>
        </div>
      )}
    </div>
  );
}