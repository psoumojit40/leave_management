'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

import { 
  setCredentials, 
  clearCredentials, 
  loginUser, 
  logoutUser,
  fetchCurrentUser // ✅ IMPORT THE NEW THUNK WE MADE
} from '@/store/authSlice';

import { RootState, AppDispatch } from '@/store'; 

interface JWTPayload {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  exp: number;
}

export default function useAuth() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // 1. Pull current auth state from Redux
  const { user, token, loading, error } = useSelector((state: RootState) => state.auth);

  // 2. Persistent Login Check (Hydration)
  const checkAuthStatus = useCallback(() => {
    // SSR Guard: localStorage only exists in the browser
    if (typeof window === 'undefined') return;

    const savedToken = localStorage.getItem('token');
    
    // Only attempt hydration if there is a token and no user in state (meaning we just refreshed)
    if (savedToken && !user) {
      try {
        const decoded = jwtDecode<JWTPayload>(savedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token expired, clear it
          dispatch(logoutUser());
        } else {
          // ✅ THE FIX: Stop using the stale decoded token! 
          // Ask the backend for the absolute newest database profile.
          dispatch(fetchCurrentUser());
        }
      } catch (err) {
        // If decoding fails, the token is likely corrupt
        dispatch(logoutUser());
      }
    }
  }, [user, dispatch]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // 3. Facade Methods
  const login = async (email: string, pass: string) => {
    // Triggers the Async Thunk we defined in authSlice
    // Note: your previous file mapped 'email' to 'loginId'. Let's keep it consistent.
    const result = await dispatch(loginUser({ loginId: email, password: pass, role: '' })); 
    
    // If Redux successfully logged in, redirect to dashboard
    if (loginUser.fulfilled.match(result)) {
      router.push('/dashboard');
    }
    return result;
  };

  const logout = () => {
    // Clear Redux and LocalStorage via the thunk
    dispatch(logoutUser());
    router.push('/auth/login');
  };

  // Helper methods for role-based UI logic
  const hasRole = (role: 'employee' | 'manager' | 'admin') => user?.role === role;
  
  const hasAnyRole = (roles: ('employee' | 'manager' | 'admin')[]) => 
    user && roles.includes(user.role);

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
  };
}