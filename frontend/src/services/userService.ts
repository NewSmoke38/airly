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

export interface UserProfileData {
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

export interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  pfp?: File;
}

const API_BASE_URL = '/users';

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

  async getUserProfile(username: string): Promise<UserProfile> {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>(`profile/u/${username}`);
    return response.data.data;
  },

  async getOwnProfile(): Promise<UserProfile> {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>('profile/me');
    return response.data.data;
  },

  async getUserPosts(username: string, cursor?: string, batch = 12) {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('batch', batch.toString());

    const response = await axiosInstance.get(`profile/u/${username}/posts?${params.toString()}`);
    return response.data.data;
  },

  async toggleFollow(userId: string): Promise<RelationshipResponse> {
    const response = await axiosInstance.post<ApiResponse<RelationshipResponse>>(`users/${userId}/follow`);
    return response.data.data;
  },

  async toggleBlock(userId: string): Promise<RelationshipResponse> {
    const response = await axiosInstance.post<ApiResponse<RelationshipResponse>>(`users/${userId}/block`);
    return response.data.data;
  },

  async getUserRelationship(userId: string): Promise<{ isFollowing: boolean; isFollowedBy: boolean; isBlocked: boolean }> {
    const response = await axiosInstance.get<ApiResponse<{ isFollowing: boolean; isFollowedBy: boolean; isBlocked: boolean }>>(`${API_BASE_URL}/${userId}/relationship`);
    return response.data.data;
  },

  async updateUserProfile(data: UpdateProfileData): Promise<UserProfileData> {
    const formData = new FormData();
    if (data.fullName) formData.append('fullName', data.fullName);
    if (data.bio) formData.append('bio', data.bio);
    if (data.pfp) formData.append('pfp', data.pfp);

    const response = await axiosInstance.patch<ApiResponse<UserProfileData>>(`${API_BASE_URL}/update-profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async searchUsers(query: string): Promise<User[]> {
    const params = new URLSearchParams();
    params.append('query', query);

    const response = await axiosInstance.get<ApiResponse<User[]>>(`${API_BASE_URL}/search`, { params });
    return response.data.data;
  },
}; 