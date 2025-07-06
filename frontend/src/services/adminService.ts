import axios from '../lib/axios';

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  pfp: string;
  createdAt: string;
  followers: string[];
  following: string[];
}

export interface AnalyticsOverview {
  totalUsers: number;
  totalTweets: number;
  totalLikes: number;
  totalViews: number;
  totalBookmarks: number;
  totalComments: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  newTweetsThisMonth: number;
  newTweetsThisWeek: number;
}

export interface ChartData {
  dailyRegistrations: Array<{ _id: string; count: number }>;
  dailyPosts: Array<{ _id: string; count: number }>;
}

export interface PopularTag {
  tag: string;
  count: number;
}

export interface ActiveUser {
  _id: string;
  postCount: number;
  fullName: string;
  username: string;
  pfp: string;
}

export interface LikedPost {
  _id: string;
  title: string;
  content: string;
  media: string;
  likesCount: number;
  views: number;
  createdAt: string;
  user: {
    fullName: string;
    username: string;
    pfp: string;
  };
}

export interface AnalyticsInsights {
  popularTags: PopularTag[];
  mostActiveUsers: ActiveUser[];
  mostLikedPosts: LikedPost[];
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  charts: ChartData;
  insights: AnalyticsInsights;
}

export interface UserStats {
  totalUsers: Array<{ count: number }>;
  newUsers: Array<{ count: number }>;
  usersByRole: Array<{ _id: string; count: number }>;
  recentUsers: User[];
}

export interface ContentStats {
  totalPosts: Array<{ count: number }>;
  newPosts: Array<{ count: number }>;
  engagementStats: Array<{
    totalLikes: number;
    totalBookmarks: number;
    totalViews: number;
    totalComments: number;
    avgLikes: number;
    avgViews: number;
  }>;
  topPosts: Array<{
    _id: string;
    title: string;
    content: string;
    likesCount: number;
    views: number;
    commentCount: number;
    createdAt: string;
    author: {
      fullName: string;
      username: string;
    };
  }>;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class AdminService {
  async getAnalytics(): Promise<AnalyticsData> {
    const response = await axios.get('/admin/analytics');
    return response.data.data;
  }

  async getUserStats(period: string = '30'): Promise<UserStats> {
    const response = await axios.get(`/admin/analytics/users?period=${period}`);
    return response.data.data;
  }

  async getContentStats(period: string = '30'): Promise<ContentStats> {
    const response = await axios.get(`/admin/analytics/content?period=${period}`);
    return response.data.data;
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<PaginatedUsers> {
    const response = await axios.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data.data;
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response = await axios.patch(`/admin/users/${userId}`, userData);
    return response.data.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await axios.delete(`/admin/users/${userId}`);
  }
}

export const adminService = new AdminService(); 