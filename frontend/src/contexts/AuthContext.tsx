import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { userService } from '../services/userService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, username: string, password: string, pfp?: File) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const isValid = await userService.validateToken();
        if (isValid) {
          const user = await userService.getCurrentUser();
          setAuthState({
            isAuthenticated: true,
            user,
          });
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await userService.login({ email, password });
      setAuthState({
        isAuthenticated: true,
        user,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (fullName: string, email: string, username: string, password: string, pfp?: File) => {
    try {
      const { user, token } = await userService.signup({ fullName, email, username, password, pfp });
      setAuthState({
        isAuthenticated: true,
        user,
      });
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
      });
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};