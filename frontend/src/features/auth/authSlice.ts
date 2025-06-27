import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  pfp: string;
  role: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  bio?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

const LOCAL_STORAGE_KEY = 'auth';

const loadFromLocalStorage = (): AuthState => {
  try {
    const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!serialized) return initialState;
    return JSON.parse(serialized);
  } catch {
    return initialState;
  }
};

const saveToLocalStorage = (state: AuthState) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Handle localStorage errors silently
    console.error('Failed to save auth state to localStorage:', error);
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadFromLocalStorage(),
  reducers: {
    loginSuccess(state: AuthState, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      saveToLocalStorage(state);
    },
    logout() {
      // State will be reset by the root reducer in store.ts
      // localStorage will also be cleared by the root reducer
      return initialState;
    },
    initializeAuth(state: AuthState) {
      const loaded = loadFromLocalStorage();
      state.user = loaded.user;
      state.accessToken = loaded.accessToken;
      state.refreshToken = loaded.refreshToken;
    },
  },
});

export const { loginSuccess, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer; 