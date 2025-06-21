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
  console.log('Transforming backend post:', backendPost);
  
  const transformed = {
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
    tags: backendPost.tags || [], // Use tags from backend, fallback to empty array
    createdAt: backendPost.createdAt,
    likes: backendPost.likes || 0,
    isLiked: false // This would need to be determined by checking if current user is in likes array
  };
  
  console.log('Transformed post:', transformed);
  return transformed;
};

export const feedService = {
  // Get all posts for the feed
  async getFeed(page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      console.log('Fetching feed from API...');
      const response = await axios.get(`/feed?batch=${limit}`);
      console.log('API Response:', response.data);
      
      const data = response.data.data || response.data;
      console.log('Processed data:', data);
      
      // Transform backend posts to frontend format
      const posts = data.posts ? data.posts.map(transformPost) : [];
      console.log('Transformed posts:', posts);
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
      
      // The backend only returns success message, not updated like data
      // We'll return a simple response and let the UI handle the optimistic update
      return {
        likes: 0, // This will be handled by the UI
        isLiked: true // This will be toggled by the UI
      };
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
  },

  // Search posts by tags
  async searchByTags(tags: string[], page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const tagsParam = Array.isArray(tags) ? tags.join(',') : tags;
      const response = await axios.get(`/tweets/search/tags?tags=${encodeURIComponent(tagsParam)}&batch=${limit}`);
      const data = response.data.data || response.data;
      
      const posts = data.tweets ? data.tweets.map(transformPost) : [];
      return posts;
    } catch (error) {
      console.error('Error searching posts by tags:', error);
      throw error;
    }
  },

  // Get popular tags
  async getPopularTags(limit: number = 20): Promise<{ tag: string; count: number }[]> {
    try {
      const response = await axios.get(`/tweets/popular-tags?limit=${limit}`);
      const data = response.data.data || response.data;
      
      return data.tags || [];
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      throw error;
    }
  }
};
