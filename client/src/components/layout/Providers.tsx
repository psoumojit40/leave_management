'use client';

import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from '@/store';
import { useEffect } from 'react';
import { fetchCurrentUser } from '@/store/authSlice'; // ✅ Pulling in your fetch action

// 🧠 1. Create a tiny, invisible wrapper to run our refresh logic
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // When the app first loads or refreshes, check if we have a token saved
    // (Adjust 'token' if you named your localStorage key something else!)
    const token = localStorage.getItem('token'); 
    
    if (token) {
      // If a token survived the refresh, instantly fetch the user data to refill Redux!
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return <>{children}</>;
}

// 🛡️ 2. Wrap your entire app with both the Redux Provider AND our new Initializer
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </Provider>
  );
}