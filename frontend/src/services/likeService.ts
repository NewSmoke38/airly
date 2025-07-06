import axios from '../lib/axios';
import { Post } from '../types';

export interface LikedPostsResponse {
  tweets: Post[];
  hasMore: boolean;
  nextCursor?: string;
}

class LikeService {
  async getUserLikedPosts(cursor?: string, limit: number = 12): Promise<LikedPostsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('batch', limit.toString());

    const response = await axios.get(`/likes/user/liked-tweets?${params.toString()}`);
    return response.data.data;
  }

  async toggleLike(tweetId: string): Promise<{ liked: boolean; likesCount: number }> {
    const response = await axios.post(`/likes/tweets/${tweetId}/like`);
    return response.data.data;
  }

  async checkUserLiked(tweetId: string): Promise<{ liked: boolean }> {
    const response = await axios.get(`/likes/tweets/${tweetId}/liked`);
    return response.data.data;
  }

  async getLikeCount(tweetId: string): Promise<{ likesCount: number }> {
    const response = await axios.get(`/likes/tweets/${tweetId}/likes`);
    return response.data.data;
  }
}

export const likeService = new LikeService(); 