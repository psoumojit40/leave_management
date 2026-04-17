'use client';

import { Bell, User, LogOut, Search, Menu } from 'lucide-react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/store';
import { logoutUser } from '@/store/authSlice';

export function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // ✅ Search is only for Managers and Admins
  const canSearch = user?.role === 'manager' || user?.role === 'admin';

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  const getInitials = () => {
    if (!user?.firstName) return '??';
    return `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 w-full">

      {/* 1. Mobile Menu Icon (Only visible on small screens) */}
      <div className="md:hidden flex items-center text-gray-600">
        <Menu className="w-6 h-6" />
      </div>

      {/* 2. Center Section: Search Bar (Only for Manager/Admin) */}
      <div className="flex-1 flex justify-center">
        {canSearch && (
          <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-80 lg:w-96 transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search records or dates..."
              className="bg-transparent border-none text-sm focus:ring-0 w-full placeholder:text-gray-400 text-gray-600"
            />
          </div>
        )}
      </div>

      {/* 3. Right Side: Notifications & Profile */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-100 hidden sm:block"></div>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
              </p>
              <p className="text-[10px] text-gray-400 font-medium tracking-tight uppercase">
                {user?.role || 'User'}
              </p>
            </div>

            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm border-2 border-indigo-100 shadow-sm">
              {getInitials()}
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setShowProfileMenu(false); 
                    router.push('/settings');  
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center transition-colors"
                >
                  <User className="w-4 h-4 mr-2" /> My Profile
                </button>
                <div className="h-[1px] bg-gray-50 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}