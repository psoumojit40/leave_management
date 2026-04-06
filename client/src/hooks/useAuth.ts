'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

// FIX: Path must match your actual folder structure (no /slices/)
import { 
  setCredentials, 
  clearCredentials, 
  loginUser, 
  logoutUser 
} from '@/store/authSlice';

// This will now find the index.ts you just created
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
    
    // Only attempt hydration if there is a token and no user in state
    if (savedToken && !user) {
      try {
        const decoded = jwtDecode<JWTPayload>(savedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token expired, clear it
          dispatch(logoutUser());
        } else {
          // Re-populate Redux state with decoded user data
          dispatch(setCredentials({
            user: {
              id: decoded.id,
              name: decoded.name,
              email: decoded.email,
              role: decoded.role,
            },
            token: savedToken
          }));
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
    const result = await dispatch(loginUser({ email, password: pass }));
    
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