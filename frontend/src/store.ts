import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { AnyAction } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';

// Define the root reducer
const rootReducer = combineReducers({
  auth: authReducer,
});

// Create a root reducer that can reset state
const createRootReducer = (state: ReturnType<typeof rootReducer> | undefined, action: AnyAction) => {
  // Clear all state when logout action is dispatched
  if (action.type === 'auth/logout') {
    state = undefined;
    // Also clear localStorage
    localStorage.removeItem('auth');
  }
  
  return rootReducer(state, action);
};

export const store = configureStore({
  reducer: createRootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 