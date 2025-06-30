import axios from '../lib/axios';

export interface CreateTweetData {
  title: string;
  content: string;
  media: File;
  tags?: string[];
}

export interface Tweet {
  _id: string;
  title: string;
  content: string;
  media: string;
  tags: string[];
  user: {
    _id: string;
    username: string;
    fullName: string;
    pfp: string;
  };
  likes: number;
  views: number;
  comments: number;
  createdAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class TweetService {
  async createTweet(data: CreateTweetData): Promise<ApiResponse<Tweet>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('media', data.media);
    
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        formData.append('tags[]', tag);
      });
    }

    const response = await axios.post('/tweets/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getTweets(cursor?: string, batch = 20): Promise<ApiResponse<{ tweets: Tweet[]; hasMore: boolean; nextCursor?: string }>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('batch', batch.toString());

    const response = await axios.get(`/tweets?${params.toString()}`);
    return response.data;
  }

  async getTweet(id: string): Promise<ApiResponse<Tweet>> {
    const response = await axios.get(`/tweets/${id}`);
    return response.data;
  }

  // Like functionality
  async toggleLike(tweetId: string): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
    const response = await axios.post(`/likes/tweets/${tweetId}/like`);
    return response.data;
  }

  async getLikeCount(tweetId: string): Promise<ApiResponse<{ likeCount: number }>> {
    const response = await axios.get(`/likes/tweets/${tweetId}/likes`);
    return response.data;
  }

  async checkUserLiked(tweetId: string): Promise<ApiResponse<{ liked: boolean }>> {
    const response = await axios.get(`/likes/tweets/${tweetId}/liked`);
    return response.data;
  }

  async getMostLikedTweets(limit = 10, cursor?: string): Promise<ApiResponse<{ tweets: Tweet[]; hasMore: boolean; nextCursor?: string }>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);

    const response = await axios.get(`/likes/tweets/most-liked?${params.toString()}`);
    return response.data;
  }

  async getUserLikedTweets(cursor?: string, batch = 12): Promise<ApiResponse<{ tweets: Tweet[]; hasMore: boolean; nextCursor?: string }>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('batch', batch.toString());

    const response = await axios.get(`/likes/user/liked-tweets?${params.toString()}`);
    return response.data;
  }

  // Bookmark functionality
  async toggleBookmark(tweetId: string): Promise<ApiResponse<{ bookmarked: boolean; bookmarkCount: number }>> {
    const response = await axios.post(`/bookmarks/tweets/${tweetId}/bookmark`);
    return response.data;
  }

  async getBookmarkCount(tweetId: string): Promise<ApiResponse<{ bookmarkCount: number }>> {
    const response = await axios.get(`/bookmarks/tweets/${tweetId}/bookmarks`);
    return response.data;
  }

  async checkUserBookmarked(tweetId: string): Promise<ApiResponse<{ bookmarked: boolean }>> {
    const response = await axios.get(`/bookmarks/tweets/${tweetId}/bookmarked`);
    return response.data;
  }

  async getMostBookmarkedTweets(limit = 10, cursor?: string): Promise<ApiResponse<{ tweets: Tweet[]; hasMore: boolean; nextCursor?: string }>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);

    const response = await axios.get(`/bookmarks/tweets/most-bookmarked?${params.toString()}`);
    return response.data;
  }

  async getUserBookmarkedTweets(cursor?: string, batch = 12): Promise<ApiResponse<{ tweets: Tweet[]; hasMore: boolean; nextCursor?: string }>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('batch', batch.toString());

    const response = await axios.get(`/bookmarks/user/bookmarked-tweets?${params.toString()}`);
    return response.data;
  }

  // Views functionality
  async incrementView(tweetId: string): Promise<ApiResponse<{ views: number }>> {
    const response = await axios.post(`/views/tweets/${tweetId}/view`);
    return response.data;
  }

  async getViewCount(tweetId: string): Promise<ApiResponse<{ views: number }>> {
    const response = await axios.get(`/views/tweets/${tweetId}/views`);
    return response.data;
  }

  async getMostViewedTweets(limit = 10, cursor?: string): Promise<ApiResponse<{ tweets: Tweet[]; hasMore: boolean; nextCursor?: string }>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);

    const response = await axios.get(`/views/tweets/most-viewed?${params.toString()}`);
    return response.data;
  }

  async getUserViewedTweets(cursor?: string, batch = 12): Promise<ApiResponse<{ tweets: Tweet[]; hasMore: boolean; nextCursor?: string }>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('batch', batch.toString());

    const response = await axios.get(`/views/user/viewed-tweets?${params.toString()}`);
    return response.data;
  }

  // Comments functionality
  async getComments(tweetId: string, cursor?: string, batch = 20): Promise<ApiResponse<{ comments: any[]; hasMore: boolean; nextCursor?: string }>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('batch', batch.toString());

    const response = await axios.get(`/tweets/${tweetId}/comments?${params.toString()}`);
    return response.data;
  }

  async createComment(tweetId: string, content: string): Promise<ApiResponse<any>> {
    const response = await axios.post(`/tweets/${tweetId}/comments`, { content });
    return response.data;
  }

  async getCommentCount(tweetId: string): Promise<ApiResponse<{ count: number }>> {
    const response = await axios.get(`/tweets/${tweetId}/comments/count`);
    return response.data;
  }

  async editComment(commentId: string, content: string): Promise<ApiResponse<any>> {
    const response = await axios.patch(`/comments/${commentId}`, { content });
    return response.data;
  }

  async deleteComment(commentId: string): Promise<ApiResponse<any>> {
    const response = await axios.delete(`/comments/${commentId}`);
    return response.data;
  }

  async likeComment(commentId: string): Promise<ApiResponse<any>> {
    const response = await axios.post(`/comments/${commentId}/like`);
    return response.data;
  }

  // Search functionality
  async searchContent(query: string, type: 'all' | 'tweets' | 'users' = 'all', cursor?: string, batch = 20): Promise<ApiResponse<{
    tweets: Tweet[];
    users: any[];
    hasMore: boolean;
    nextCursor?: string;
    searchQuery: string;
    searchType: string;
    totalResults: number;
  }>> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('type', type);
    params.append('batch', batch.toString());
    if (cursor) params.append('cursor', cursor);

    const response = await axios.get(`/tweets/search?${params.toString()}`);
    return response.data;
  }

  async searchTweetsByTags(tags: string, cursor?: string, batch = 20): Promise<ApiResponse<{
    tweets: Tweet[];
    hasMore: boolean;
    nextCursor?: string;
    searchTags: string[];
  }>> {
    const params = new URLSearchParams();
    params.append('tags', tags);
    params.append('batch', batch.toString());
    if (cursor) params.append('cursor', cursor);

    const response = await axios.get(`/tweets/search/tags?${params.toString()}`);
    return response.data;
  }

  async getPopularTags(limit = 20): Promise<ApiResponse<{ tags: Array<{ tag: string; count: number }> }>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await axios.get(`/tweets/popular-tags?${params.toString()}`);
    return response.data;
  }

  // Share functionality
  async getShareableLink(tweetId: string): Promise<string> {
    return `${window.location.origin}/dashboard/post/${tweetId}`;
  }
}

export const tweetService = new TweetService(); 