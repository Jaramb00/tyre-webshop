import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';
import type { AuthResponse } from '../../types';

interface AuthState {
  user: { id: string; email: string; fullName: string; avatarUrl?: string; roles: string[] } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  error: null,
};

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Login failed');
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (payload: { firstName: string; lastName: string; email: string; password: string; confirmPassword: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const { accessToken, refreshToken, userId, email, fullName, avatarUrl, roles } = action.payload;
        state.user = { id: userId, email, fullName, avatarUrl, roles };
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        localStorage.setItem('user', JSON.stringify(state.user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        const { accessToken, refreshToken, userId, email, fullName, avatarUrl, roles } = action.payload;
        state.user = { id: userId, email, fullName, avatarUrl, roles };
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        localStorage.setItem('user', JSON.stringify(state.user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      });
  },
});

export const { logout, setTokens } = authSlice.actions;
export default authSlice.reducer;
