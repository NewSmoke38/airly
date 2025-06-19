import axios from '../lib/axios';
import { Post } from '../types';

export interface FeedResponse {
  success: boolean;
  data: {
    posts: Post[];
    hasMore: boolean;
    nextCursor: string | null;
  };
  message: string;
}

export interface LikeResponse {
  success: boolean;
  data: { likes: number; isLiked: boolean };
  message: string;
}

// Transform backend post format to frontend format
const transformPost = (backendPost: any): Post => {
  return {
    id: backendPost._id,
    title: backendPost.title,
    description: backendPost.content,
    imageUrl: backendPost.media,
    authorId: backendPost.user._id,
    author: {
      id: backendPost.user._id,
      name: backendPost.user.fullName,
      email: '', // Backend doesn't return email for security
      avatar: backendPost.user.pfp
    },
    tags: [], // Backend doesn't have tags yet
    createdAt: backendPost.createdAt,
    likes: backendPost.likes || 0,
    isLiked: false // This would need to be determined by checking if current user is in likes array
  };
};

export const feedService = {
  // Get all posts for the feed
  async getFeed(page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const response = await axios.get(`/feed?batch=${limit}`);
      const data = response.data.data || response.data;
      
      // Transform backend posts to frontend format
      const posts = data.posts ? data.posts.map(transformPost) : [];
      return posts;
    } catch (error) {
      console.error('Error fetching feed:', error);
      throw error;
    }
  },

  // Get posts by category/tags
  async getPostsByCategory(category: string, page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const response = await axios.get(`/feed/category/${category}?page=${page}&limit=${limit}`);
      const data = response.data.data || response.data;
      
      const posts = data.posts ? data.posts.map(transformPost) : [];
      return posts;
    } catch (error) {
      console.error('Error fetching posts by category:', error);
      throw error;
    }
  },

  // Search posts
  async searchPosts(query: string, page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const response = await axios.get(`/feed/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      const data = response.data.data || response.data;
      
      const posts = data.posts ? data.posts.map(transformPost) : [];
      return posts;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  },

  // Like/unlike a post
  async toggleLike(postId: string): Promise<{ likes: number; isLiked: boolean }> {
    try {
      const response = await axios.post(`/tweets/${postId}/like`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  // Get trending posts
  async getTrendingPosts(limit: number = 10): Promise<Post[]> {
    try {
      const response = await axios.get(`/feed/trending?limit=${limit}`);
      const data = response.data.data || response.data;
      
      const posts = data.posts ? data.posts.map(transformPost) : [];
      return posts;
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      throw error;
    }
  },

  // Get user's liked posts
  async getLikedPosts(userId: string, page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const response = await axios.get(`/feed/liked/${userId}?page=${page}&limit=${limit}`);
      const data = response.data.data || response.data;
      
      const posts = data.posts ? data.posts.map(transformPost) : [];
      return posts;
    } catch (error) {
      console.error('Error fetching liked posts:', error);
      throw error;
    }
  },

  // Get posts by user
  async getUserPosts(userId: string, page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const response = await axios.get(`/feed/user/${userId}?page=${page}&limit=${limit}`);
      const data = response.data.data || response.data;
      
      const posts = data.posts ? data.posts.map(transformPost) : [];
      return posts;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  }
};
