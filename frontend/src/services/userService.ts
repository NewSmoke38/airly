import axiosInstance from '../lib/axios';
import { User } from '../types';

interface LoginData {
  email?: string;
  username?: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  pfp: File;
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const userService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('pfp', data.pfp);

    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('users/login', data);
    return response.data.data;
  },
}; 