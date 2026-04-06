import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// FIX 1: Import the notification action
import { pushNotification } from '@/store/notificationSlice';

export interface LeaveRequest {
  id: string;
  type: 'Vacation' | 'Sick Leave' | 'Personal Leave';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  employeeName?: string;
}

interface LeaveBalances {
  [key: string]: { used: number; total: number };
}

interface LeaveStats {
  totalDays: number;
  usedDays: number;
  pendingDays: number;
}

interface LeaveState {
  requests: LeaveRequest[];
  balances: LeaveBalances;
  stats: LeaveStats;
  loading: boolean;
  error: string | null;
}

const initialState: LeaveState = {
  requests: [],
  balances: {
    vacation: { used: 0, total: 20 },
    sick: { used: 0, total: 10 },
    personal: { used: 0, total: 5 },
  },
  stats: { totalDays: 35, usedDays: 0, pendingDays: 0 },
  loading: false,
  error: null,
};

// 2. Async Thunks
export const fetchLeaveData = createAsyncThunk(
  'leave/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        requests: [
          { id: '1', type: 'Vacation', startDate: '2026-04-10', endDate: '2026-04-15', days: 6, reason: 'Family trip', status: 'approved', appliedOn: '2026-04-01' }
        ],
        balances: { vacation: { used: 6, total: 20 }, sick: { used: 0, total: 10 }, personal: { used: 0, total: 5 } }
      };
    } catch (error: any) {
      return rejectWithValue('Failed to load leave data');
    }
  }
);

export const submitLeaveRequest = createAsyncThunk(
  'leave/submitRequest',
  // FIX 2: Added { dispatch } from thunkAPI
  async (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn' | 'days'>, { dispatch, rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const start = new Date(leaveData.startDate);
      const end = new Date(leaveData.endDate);
      const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
      
      const newRequest = {
        ...leaveData,
        id: `LR-${Date.now()}`,
        days: daysCount,
        status: 'pending' as const,
        appliedOn: new Date().toISOString().split('T')[0],
      };

      // FIX 3: Trigger the notification toast on success
      dispatch(pushNotification({
        message: `Leave request for ${daysCount} day(s) submitted successfully!`,
        type: 'success'
      }));

      return newRequest;
    } catch (error: any) {
      return rejectWithValue('Failed to submit request');
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
      .addCase(fetchLeaveData.pending, (state) => { state.loading = true; })
      .addCase(fetchLeaveData.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests as LeaveRequest[];
        state.balances = action.payload.balances;
      })
      .addCase(submitLeaveRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitLeaveRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload as LeaveRequest);
        
        const type = action.payload.type.toLowerCase().replace(' ', '') as keyof LeaveBalances;
        if (state.balances[type]) {
          state.balances[type].used += action.payload.days;
        }
      })
      // FIX 4: Improved Status Update Matcher
      .addMatcher(
        (action) => action.type.includes('Request/fulfilled') && !action.type.includes('submit'),
        (state, action: PayloadAction<string>) => {
          const isApprove = action.type.includes('approve');
          const newStatus = isApprove ? 'approved' : 'rejected';
          
          state.requests = state.requests.map(req => 
            req.id === action.payload ? { ...req, status: newStatus } : req
          );
          state.loading = false;
        }
      );
  },
});

export const { clearLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;