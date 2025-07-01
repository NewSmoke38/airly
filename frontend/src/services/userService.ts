import api from '../lib/axios';
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

interface UserProfile {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  pfp: string;
  bio?: string;
  joinedDate: string;
  followerCount: number;
  followingCount: number;
  relationshipStatus: {
    isOwnProfile: boolean;
    isFollowing: boolean;
    isBlocked: boolean;
  };
}

interface RelationshipResponse {
  isFollowing: boolean;
  isBlocked?: boolean;
  message: string;
}

export const userService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('pfp', data.pfp);

    const response = await api.post<ApiResponse<AuthResponse>>('users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('users/login', data);
    return response.data.data;
  },

  // Profile functions
  async getUserProfile(username: string): Promise<UserProfile> {
    const response = await api.get<ApiResponse<UserProfile>>(`profile/u/${username}`);
    return response.data.data;
  },

  async getOwnProfile(): Promise<UserProfile> {
    const response = await api.get<ApiResponse<UserProfile>>('profile/me');
    return response.data.data;
  },

  async getUserPosts(username: string, cursor?: string, batch = 12) {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('batch', batch.toString());

    const response = await api.get(`profile/u/${username}/posts?${params.toString()}`);
    return response.data.data;
  },

  // Social functions
  async toggleFollow(userId: string): Promise<RelationshipResponse> {
    const response = await api.post<ApiResponse<RelationshipResponse>>(`users/${userId}/follow`);
    return response.data.data;
  },

  async toggleBlock(userId: string): Promise<RelationshipResponse> {
    const response = await api.post<ApiResponse<RelationshipResponse>>(`users/${userId}/block`);
    return response.data.data;
  },

  async getUserRelationship(userId: string) {
    const response = await api.get(`users/${userId}/relationship`);
    return response.data.data;
  },
}; 