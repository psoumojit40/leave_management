import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // Matches your folder structure
import leaveReducer from './leaveSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leave: leaveReducer,
    notifications: notificationReducer,
  },
});

// These two exports are what 'useAuth.ts' is looking for!
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;