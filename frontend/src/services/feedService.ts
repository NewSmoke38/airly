import axiosInstance from '../lib/axios';
import { FeedResponse } from '../types';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
}

export const feedService = {
  async getFeedPosts(cursor?: string, batch: number = 20): Promise<FeedResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('batch', batch.toString());

    const response = await axiosInstance.get<ApiResponse<FeedResponse>>(`/feed?${params.toString()}`);
    return response.data.data;
  },
}; 