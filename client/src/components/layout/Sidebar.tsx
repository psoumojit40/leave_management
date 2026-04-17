'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux'; 
import { RootState } from '@/store';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  // ✅ Get the REAL user from Redux
  const { user } = useSelector((state: RootState) => state.auth);

  // ✅ Branding Logic (Matches Navbar Option B)
  const getPortalInfo = () => {
    switch (user?.role?.toLowerCase()) {
      case 'admin':
        return { name: 'Control', initial: 'C' };
      case 'manager':
        return { name: 'Team Hub', initial: 'T' };
      case 'employee':
        return { name: 'My Desk', initial: 'M' };
      default:
        return { name: 'HR Portal', initial: 'H' };
    }
  };

  const portal = getPortalInfo();

  // Define menu items with role access
  const allItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠', roles: ['employee', 'manager', 'admin'] },
    { name: 'Leave History', href: '/leave/history', icon: '📅', roles: ['employee', 'manager', 'admin'] },
    { name: 'Mark Attendance', href: '/attendance/mark', icon: '⏰', roles: ['employee', 'admin'] },
    { name: 'Attendance Reports', href: '/attendance/reports', icon: '📊', roles: ['employee', 'admin'] },
    { name: 'My Dept', href: '/department', icon: '🏢', roles: ['manager'] },
    { name: 'My Team', href: '/team', icon: '👥', roles: ['employee', 'manager', 'admin'] },

    // { name: 'Department Attendance', href: '/', icon: '🧮', roles: ['employee', 'manager'] },

    { name: 'Team Invitations', href: '/team/invitations', icon: '✉️', roles: ['employee'] },
    // { name: 'Settings', href: '/settings', icon: '⚙️', roles: ['employee', 'manager', 'admin'] },
    { name: 'Holidays', href: '/holidays', icon: '🎉', roles: ['employee', 'manager', 'admin'] },
    
    // Restricted Items
    { name: 'Dept Leave History', href: '/approvals', icon: '✈', roles: ['manager', 'admin'] },
    { name: 'Audit Log', href: '/audit-log', icon: '📋', roles: ['admin',] },
    { name: 'Users', href: '/users', icon: '👤', roles: ['admin'] },
    { name: 'Payroll Export', href: '/payroll-export', icon: '💰', roles: ['admin',] },
  ];

  // Filter items based on current user's role
  const visibleItems = allItems.filter(item => 
    user?.role && item.roles.includes(user.role.toLowerCase())
  );

  return (
    <aside className={`relative h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col z-40 ${isOpen ? 'w-64' : 'w-20'}`}>
      
      {/* Dynamic Branding Header */}
      <Link 
        href="/dashboard"
        className="flex items-center p-4 h-16 border-b border-gray-100 overflow-hidden group cursor-pointer hover:bg-gray-50/80 transition-colors"
      >
        <div className="min-w-[40px] w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 group-hover:scale-105 group-hover:shadow-indigo-200 transition-all">
          {/* ✅ Dynamic Brand Initial */}
          {portal.initial}
        </div>
        <div className={`ml-3 flex flex-col transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <span className="font-black text-gray-900 tracking-tight leading-none whitespace-nowrap group-hover:text-indigo-700 transition-colors">
            {/* ✅ Dynamic Brand Name */}
            {portal.name}
          </span>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
            System
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 mt-4 overflow-y-auto overflow-x-hidden px-3 space-y-1 [&::-webkit-scrollbar]:hidden">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center h-11 px-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-xl min-w-[24px] flex justify-center">{item.icon}</span>
              <span className={`ml-3 font-bold text-sm transition-all whitespace-nowrap ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Toggle Section */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center overflow-hidden">
          <div className="min-w-[36px] w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className={`ml-3 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            <p className="text-xs font-black text-gray-900 leading-none mb-1 truncate max-w-[120px]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
              {user?.role}
            </p>
          </div>
        </div>  
        
        {/* Toggle Expand/Collapse Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="mt-4 w-full flex items-center justify-center p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>
    </aside>
  );
}