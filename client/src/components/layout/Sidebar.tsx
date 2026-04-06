'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux'; // ✅ Hook to get Redux data
import { RootState } from '@/store';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  // ✅ Get the REAL user from Redux
  const { user } = useSelector((state: RootState) => state.auth);

  // Define menu items with role access
  const allItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠', roles: ['employee', 'manager', 'admin'] },
    { name: 'Leave History', href: '/leave/history', icon: '📅', roles: ['employee', 'manager', 'admin'] },
    { name: 'Mark Attendance', href: '/attendance/mark', icon: '⏰', roles: ['employee', 'manager', 'admin'] },
    { name: 'Attendance Reports', href: '/attendance/reports', icon: '📊', roles: ['employee', 'manager', 'admin'] },
    { name: 'Team', href: '/team', icon: '👥', roles: ['employee', 'manager', 'admin'] },
    { name: 'Settings', href: '/settings', icon: '⚙️', roles: ['employee', 'manager', 'admin'] },
    { name: 'Holidays', href: '/holidays', icon: '🎉', roles: ['employee', 'manager', 'admin'] },
    
    // Restricted Items
    { name: 'Approvals', href: '/approvals', icon: '✅', roles: ['manager', 'admin'] },
    { name: 'Audit Log', href: '/audit-log', icon: '📋', roles: ['manager', 'admin'] },
    { name: 'Users', href: '/users', icon: '👤', roles: ['admin'] },
    { name: 'Payroll Export', href: '/payroll-export', icon: '💰', roles: ['admin'] },
  ];

  // Filter items based on current user's role
  const visibleItems = allItems.filter(item => 
    user?.role && item.roles.includes(user.role.toLowerCase())
  );

  return (
    <aside className={`relative h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col z-40 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center p-4 h-16 border-b border-gray-100">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mr-3">H</div>
        <span className={`font-bold text-gray-900 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}>HR Portal</span>
      </div>

      <nav className="flex-1 mt-4 overflow-y-auto px-3 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center h-11 px-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>
              <span className="text-xl min-w-[24px] flex justify-center">{item.icon}</span>
              <span className={`ml-3 font-medium transition-all ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Real User Profile in Sidebar */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className={`ml-3 transition-all ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            <p className="text-xs font-bold text-gray-900 leading-none mb-1">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-gray-400 uppercase font-bold">{user?.role}</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="mt-4 w-full flex items-center justify-center p-2 rounded-lg bg-white border border-gray-200 text-gray-400">
          {isOpen ? '◀' : '▶'}
        </button>
      </div>
    </aside>
  );
}