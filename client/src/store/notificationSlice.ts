import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// 1. Types
export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error'; // Added for visual styling
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number; // Added: Helpful for the "Bell" badge
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

// 2. Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      return [
        { id: '1', message: 'Your leave request has been approved!', time: '2m ago', read: false, type: 'success' },
        { id: '2', message: 'Monthly attendance report is ready.', time: '1h ago', read: false, type: 'info' },
        { id: '3', message: 'Reminder: Update your profile picture.', time: '3h ago', read: true, type: 'warning' },
      ] as Notification[];
    } catch (err) {
      return rejectWithValue('Failed to sync notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return id;
  }
);

// 3. The Slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // FIX: Action to add a notification locally (Useful for real-time toasts)
    pushNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'time' | 'read'>>) => {
      const newNotif: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        time: 'Just now',
        read: false,
      };
      state.notifications.unshift(newNotif);
      state.unreadCount += 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* Fetching */
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
        state.loading = false;
      })
      /* Mark as Read */
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notif = state.notifications.find(n => n.id === action.payload);
        if (notif && !notif.read) {
          notif.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      /* Clear All */
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      });
  },
});

export const { pushNotification, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;