import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// 1. Interfaces
// src/store/authSlice.ts

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  department?: string; // ✅ ADD THIS LINE
  employeeId?: string;
  managerId?: string;
  adminId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean; // ✅ Added this to fix the error
  loading: boolean;
  error: string | null;
}

// 2. Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false, // ✅ Starts as false
  loading: false,
  error: null,
};

// 3. Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ loginId, password, role }: { loginId: string; password: string; role: string }, { rejectWithValue }) => {
    try {
      // 1. Point this to your REAL backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      // 2. Save the token to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }

      // 3. Return the REAL user data from the database
      return { user: data.user, token: data.token };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Connection to server failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
  dispatch(clearCredentials());
  return undefined;
});

// 4. The Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true; // ✅ Update to true
      state.loading = false;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false; // ✅ Reset to false
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true; // ✅ Successful login sets this to true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false; // ✅ Ensure it stays false on error
        state.error = action.payload as string;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;