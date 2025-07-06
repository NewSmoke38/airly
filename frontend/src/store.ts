import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { AnyAction } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';

const rootReducer = combineReducers({
  auth: authReducer,
});

const createRootReducer = (state: ReturnType<typeof rootReducer> | undefined, action: AnyAction) => {
  if (action.type === 'auth/logout') {
    state = undefined;
    localStorage.removeItem('auth');
  }
  
  return rootReducer(state, action);
};

export const store = configureStore({
  reducer: createRootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 