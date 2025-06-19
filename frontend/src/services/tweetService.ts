import axios from '../lib/axios';
import { Post } from '../types';

export interface CreatePostRequest {
  title: string;
  description: string;
  tags: string[];
  media?: File;
}

export interface UpdatePostRequest {
  title?: string;
  description?: string;
  tags?: string[];
  media?: File;
}

export interface PostResponse {
  success: boolean;
  data: Post;
  message: string;
}

export interface PostsResponse {
  success: boolean;
  data: Post[];
  message: string;
}

export const tweetService = {
  // Create a new post
  async createPost(postData: CreatePostRequest): Promise<Post> {
    try {
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('description', postData.description);
      formData.append('tags', JSON.stringify(postData.tags));
      
      if (postData.media) {
        formData.append('media', postData.media);
      }
      
      const response = await axios.post(`/tweets/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Get a single post by ID
  async getPostById(postId: string): Promise<Post> {
    try {
      const response = await axios.get(`/tweets/${postId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  // Update a post
  async updatePost(postId: string, updateData: UpdatePostRequest): Promise<Post> {
    try {
      const formData = new FormData();
      
      if (updateData.title) formData.append('title', updateData.title);
      if (updateData.description) formData.append('description', updateData.description);
      if (updateData.tags) formData.append('tags', JSON.stringify(updateData.tags));
      if (updateData.media) formData.append('media', updateData.media);
      
      const response = await axios.patch(`/tweets/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete a post
  async deletePost(postId: string): Promise<void> {
    try {
      await axios.delete(`/tweets/${postId}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Get posts by current user
  async getMyPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const response = await axios.get(`/tweets/my-posts?page=${page}&limit=${limit}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching my posts:', error);
      throw error;
    }
  },

  // Get posts by user ID
  async getPostsByUser(userId: string, page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const response = await axios.get(`/tweets/user/${userId}?page=${page}&limit=${limit}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching user posts:', error);
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

  // Add comment to a post
  async addComment(postId: string, comment: string): Promise<{ commentId: string; comment: string }> {
    try {
      const response = await axios.post(`/tweets/${postId}/comments`, { comment });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Get comments for a post
  async getComments(postId: string, page: number = 1, limit: number = 20): Promise<any[]> {
    try {
      const response = await axios.get(`/tweets/${postId}/comments?page=${page}&limit=${limit}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(postId: string, commentId: string): Promise<void> {
    try {
      await axios.delete(`/tweets/${postId}/comments/${commentId}`);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Share a post
  async sharePost(postId: string): Promise<{ shareCount: number }> {
    try {
      const response = await axios.post(`/tweets/${postId}/share`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  },

  // Save/unsave a post
  async toggleSave(postId: string): Promise<{ isSaved: boolean }> {
    try {
      const response = await axios.post(`/tweets/${postId}/save`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error toggling save:', error);
      throw error;
    }
  },

  // Get saved posts
  async getSavedPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const response = await axios.get(`/tweets/saved?page=${page}&limit=${limit}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      throw error;
    }
  },

  // Report a post
  async reportPost(postId: string, reason: string): Promise<void> {
    try {
      await axios.post(`/tweets/${postId}/report`, { reason });
    } catch (error) {
      console.error('Error reporting post:', error);
      throw error;
    }
  }
};
