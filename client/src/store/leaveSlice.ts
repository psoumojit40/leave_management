import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 1. Interfaces
export interface LeaveRequest {
  _id: string; // MongoDB uses _id
  type: string;
  startDate: string;
  endDate: string;
  days: number; // Match the schema field 'days'
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string; // MongoDB auto-timestamp
  employeeId?: any; // The populated employee data
}

// ✅ NEW: Interface for the settings we created in the backend
export interface LeaveSetting {
  _id: string;
  name: string;
  defaultDays: number;
  color: string;
  isActive: boolean;
}

interface LeaveState {
  requests: LeaveRequest[];
  settings: LeaveSetting[]; // ✅ NEW: Added to state
  loading: boolean;
  error: string | null;
}

const initialState: LeaveState = {
  requests: [],
  settings: [], // ✅ NEW: Starts empty until fetched
  loading: false,
  error: null,
};

// 2. REAL API Fetch - Grabs history from your database
export const fetchLeaveData = createAsyncThunk(
  'leave/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      // Hits the controller we built: getLeaveRequests
      const res = await fetch('http://localhost:5000/api/leave', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch data');

      return data; // Returns the array of real requests
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load leave data');
    }
  }
);

// ✅ NEW: Thunk to fetch the Leave Categories
export const fetchLeaveSettings = createAsyncThunk(
  'leave/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const res = await fetch('http://localhost:5000/api/leave-settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch settings');

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load leave settings');
    }
  }
);

// 3. The Slice
const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    clearLeaveError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Handle Leave Requests
      .addCase(fetchLeaveData.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(fetchLeaveData.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload as LeaveRequest[];
      })
      .addCase(fetchLeaveData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ✅ NEW: Handle Leave Settings
      .addCase(fetchLeaveSettings.fulfilled, (state, action) => {
        state.settings = action.payload as LeaveSetting[];
      });
  },
});

export const { clearLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;