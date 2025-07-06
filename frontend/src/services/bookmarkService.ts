import axios from '../lib/axios';
import { Post } from '../types';

export interface BookmarkedPostsResponse {
  tweets: Post[];
  hasMore: boolean;
  nextCursor?: string;
}

class BookmarkService {
  async getUserBookmarkedPosts(cursor?: string, limit: number = 12): Promise<BookmarkedPostsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('batch', limit.toString());

    const response = await axios.get(`/bookmarks/user/bookmarked-tweets?${params.toString()}`);
    return response.data.data;
  }

  async toggleBookmark(tweetId: string): Promise<{ bookmarked: boolean; bookmarkCount: number }> {
    const response = await axios.post(`/bookmarks/tweets/${tweetId}/bookmark`);
    return response.data.data;
  }

  async checkUserBookmarked(tweetId: string): Promise<{ bookmarked: boolean }> {
    const response = await axios.get(`/bookmarks/tweets/${tweetId}/bookmarked`);
    return response.data.data;
  }

  async getBookmarkCount(tweetId: string): Promise<{ bookmarkCount: number }> {
    const response = await axios.get(`/bookmarks/tweets/${tweetId}/bookmarks`);
    return response.data.data;
  }
}

export const bookmarkService = new BookmarkService(); 