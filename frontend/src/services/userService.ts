import axios from '../lib/axios';
import { User, AuthState } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
  pfp?: File;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message: string;
}

// Transform backend user format to frontend format
const transformUser = (backendUser: any): User => {
  return {
    id: backendUser._id,
    name: backendUser.fullName,
    email: backendUser.email,
    avatar: backendUser.pfp,
    bio: backendUser.bio || '',
    username: backendUser.username
  };
};

export const userService = {
  // User authentication
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    try {
      // Backend accepts either username or email, we'll use email
      const response = await axios.post(`/users/login`, {
        email: credentials.email,
        password: credentials.password
      });
      
      const data = response.data.data || response.data;
      const { user: backendUser, accessToken } = data;
      
      // Store token in localStorage
      localStorage.setItem('token', accessToken);
      
      // Transform backend user to frontend format
      const user = transformUser(backendUser);
      
      return { user, token: accessToken };
    } catch (error: any) {
      console.error('Error during login:', error);
      
      // Handle specific backend errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('User not found. Please check your email.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid password. Please try again.');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  },

  async signup(userData: SignupRequest): Promise<{ user: User; token: string }> {
    try {
      // Debug logging
      console.log('Signup data received:', userData);
      
      // Validate required fields
      if (!userData.fullName?.trim()) {
        throw new Error('Full name is required');
      }
      if (!userData.email?.trim()) {
        throw new Error('Email is required');
      }
      if (!userData.username?.trim()) {
        throw new Error('Username is required');
      }
      if (!userData.password) {
        throw new Error('Password is required');
      }
      if (!userData.pfp) {
        throw new Error('Profile picture is required');
      }
      
      const formData = new FormData();
      formData.append('fullName', userData.fullName.trim());
      formData.append('email', userData.email.trim());
      formData.append('username', userData.username.trim());
      formData.append('password', userData.password);
      
      if (userData.pfp) {
        formData.append('pfp', userData.pfp);
      }
      
      // Debug: Log what's being sent
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await axios.post(`/users/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const data = response.data.data || response.data;
      const backendUser = data;
      
      // For registration, we need to login separately to get tokens
      // Let's login the user after successful registration
      const loginResponse = await this.login({
        email: userData.email,
        password: userData.password
      });
      
      return loginResponse;
    } catch (error: any) {
      console.error('Error during signup:', error);
      
      // Handle specific backend errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 409) {
        throw new Error('User with this email or username already exists.');
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  },

  async logout(): Promise<void> {
    try {
      await axios.post(`/users/logout`);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still remove token even if API call fails
      localStorage.removeItem('token');
      throw error;
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      const response = await axios.get(`/profile/me`);
      const data = response.data.data || response.data;
      return transformUser(data);
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await axios.get(`/users/${userId}`);
      const data = response.data.data || response.data;
      return transformUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(updateData: Partial<User>): Promise<User> {
    try {
      const response = await axios.patch(`/profile`, updateData);
      const data = response.data.data || response.data;
      return transformUser(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<{ avatar: string }> {
    try {
      const formData = new FormData();
      formData.append('pfp', file);
      
      const response = await axios.post(`/profile/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  },

  // Follow/unfollow user
  async toggleFollow(userId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    try {
      const response = await axios.post(`/users/${userId}/follow`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  },

  // Get user's followers
  async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<User[]> {
    try {
      const response = await axios.get(`/users/${userId}/followers?page=${page}&limit=${limit}`);
      const data = response.data.data || response.data;
      return data.map(transformUser);
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  },

  // Get user's following
  async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<User[]> {
    try {
      const response = await axios.get(`/users/${userId}/following?page=${page}&limit=${limit}`);
      const data = response.data.data || response.data;
      return data.map(transformUser);
    } catch (error) {
      console.error('Error fetching following:', error);
      throw error;
    }
  },

  // Check if token is valid
  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      await axios.get(`/profile/me`);
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
      return false;
    }
  }
};
